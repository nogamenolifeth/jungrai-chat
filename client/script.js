"use strict";

window.onload = () => {
	let datacenter = {
		message_box: () => document.querySelector('.jr-chatroom .message'),
		message_prerender: (text) => {
			let e = document.createElement("span")
			e.classList.add("usr_message")
			e.appendChild(document.createTextNode(text))
			return e
		}
	}

	const form_message = {
		input: () => document.querySelector('.jr-chatroom .input-message'),
		send: () => document.querySelector('.jr-chatroom .send-message'),
		runtime: () => {
			let input = form_message['input']()
			if (input.value === '') {
				input.focus()
				return
			}

			let output_up = document.createElement('div')
			output_up.className = 'items client'
			output_up.appendChild(datacenter['message_prerender'](input.value))

			let cn = (datacenter['message_box']().children.length - 1)
			let message = datacenter['message_box']().children[cn]
			message.classList.contains('client')
				? message.appendChild(datacenter['message_prerender'](input.value))
				: datacenter['message_box']().appendChild(output_up)

			message = datacenter['message_box']()
			message.scrollTop = message.scrollHeight
			input.value = ''
			input.focus()
		}
	}

	form_message['input']().addEventListener('keypress', (event) => {
		event.keyCode === 13 && form_message['runtime']()
	})

	form_message['send']().addEventListener('click', form_message['runtime'])
}

