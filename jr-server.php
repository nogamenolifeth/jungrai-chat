<?php
	
	set_time_limit(0);
	ob_implicit_flush();
	error_reporting(E_ALL);
	$arr = array();

	$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
	socket_set_option($socket, SOL_SOCKET, SO_REUSEADDR, 1);
	socket_bind($socket, '0.0.0.0', 9000);
	socket_listen($socket);

	$clients = [$socket];

	while(true) {
		$changed = $clients;
		socket_select($changed, $arr, $arr, 0, 10);

		if (in_array($socket, $changed)) {
			$socket_new = socket_accept($socket);
			$clients[] = $socket_new;
			
			$headers = @socket_read($socket_new, 1024);
			preg_match("/Sec-WebSocket-Key: (.*)\r\n/", $headers, $secKey);
			$secAccept = sha1($secKey[1] . '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
			$secAccept = base64_encode(pack('H*', $secAccept));
			$upgrades  = "HTTP/1.1 101 Web Socket Protocol Handshake\r\n";
			$upgrades .= "Upgrade: websocket\r\n";
			$upgrades .= "Connection: Upgrade\r\n";
			$upgrades .= "Sec-WebSocket-Accept: $secAccept\r\n\r\n";
			socket_write($socket_new, $upgrades, strlen($upgrades));
			unset($socket_new, $headers, $secKey, $secAccept, $upgrades);
			
			$found_socket = array_search($socket, $changed);
			unset($changed[$found_socket]);
			send_message([
				'type' => 'system',
				'code' => 101
			]);
		}

		foreach ($changed as $changed_socket) {
			while (@socket_recv($changed_socket, $buf, 2048, 0) >= 1) {
				$recv_text = json_decode(unmask($buf));
				if ($recv_text !== null) {
					send_message([
						'type' => 'usermsg',
						'code' => 201,
						'recv_text' => $recv_text
					]);
					break 2;
				}
			}

			if (@socket_read($changed_socket, 1024, PHP_NORMAL_READ) === false) {
				unset($clients[array_search($changed_socket, $clients)]);
				send_message([
					'type' => 'system',
					'code' => 102
				]);
			}

		} // end foreach send back and shutdown
	} // end while master

	socket_close($socket);

	function send_message($msg) {
		global $clients;
		$msg = mask(json_encode($msg));
		foreach($clients as $changed_socket) {
			@socket_write($changed_socket, $msg, strlen($msg));
		}
		return true;
	}

	function mask($text) {
		$b1 = 0x80 | (0x1 & 0x0f);
		$length = strlen($text);
		
		if ($length <= 125)
			$header = pack('CC', $b1, $length);
		elseif ($length > 125 && $length < 65536)
			$header = pack('CCn', $b1, 126, $length);
		elseif ($length >= 65536)
			$header = pack('CCNN', $b1, 127, $length);
		return $header . $text;
	}

	function unmask($text) {
		$length = ord($text[1]) & 127;
		if ($length == 126) {
			$masks = substr($text, 4, 4);
			$data = substr($text, 8);
		} elseif ($length == 127) {
			$masks = substr($text, 10, 4);
			$data = substr($text, 14);
		} else {
			$masks = substr($text, 2, 4);
			$data = substr($text, 6);
		}
		$text = "";
		for ($i = 0; $i < strlen($data); ++$i) {
			$text .= $data[$i] ^ $masks[$i%4];
		}
		return $text;
	}