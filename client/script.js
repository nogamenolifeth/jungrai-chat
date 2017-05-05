'use strict';

function createElement(node) {
  if (typeof node === 'string') return document.createTextNode(node);

  var $el = document.createElement(node.type);
  if (Object.keys(node.props).length !== 0) Object.keys(node.props).map(function (name) {
    var value = node.props[name];

    if (name === 'className') {
      $el.setAttribute('class', value);
    } else if (typeof value === 'boolean') {
      value === true ? ($el[name] = true, $el.setAttribute(name, value)) : $el[name] = false;
    } else {
      $el.setAttribute(name, value);
    }
  });

  Object.keys(node.children).map(function (key) {
    return createElement(node.children[key]);
  }).forEach($el.appendChild.bind($el));

  return $el;
}

var cc = createElement({
  'type': 'div',
  'props': { 'className': 'jr-section' },
  'children': [{
    'type': 'div',
    'props': { 'className': 'jr-primary' },
    'children': []
  },{
    'type': 'div',
    'props': { 'className': 'jr-secondary' },
    'children': [{
      'type': 'div',
      'props': { 'className': 'jr-profile' },
      'children': [{
        'type': 'div',
        'props': {},
        'children': [{
          'type': 'canvas',
          'props': {'className': 'jr-profile_picture'},
          'children': []
        }]
      },{
        'type': 'div',
        'props': {},
        'children': [{
          'type': 'div',
          'props': {'className': 'jr-profile_name'},
          'children': [{
            'type': 'span',
            'props': {'contenteditable': true, 'data-text': 'guest'},
            'children': ['guest']
          }]
        },{
          'type': 'div',
          'props': {'className': 'jr-profile_active'},
          'children': ['active on chat']
        }]
      }]
    },{
      'type': 'div',
      'props': { 'className': 'jr-onlines' },
      'children': [{
        'type': 'div',
        'props': {},
        'children': [{
          'type': 'b',
          'props': {},
          'children': ['0']
        },'\u00A0MENBER']
      },{
        'type': 'div',
        'props': {},
        'children': [{
          'type': 'b',
          'props': {},
          'children': ['0']
        },'\u00A0ADMIN']
      }]
    },{
      'type': 'div',
      'props': { 'className': 'jr-menbers' },
      'children': []
    }]
  }]
});

document.body.appendChild(cc)