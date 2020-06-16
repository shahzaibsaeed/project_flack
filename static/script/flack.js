document.addEventListener('DOMContentLoaded', () => {
  // Connect to websocket
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
  // load the DISPLAY_NAME function to prompt the input field
  display_name();
  document.querySelector('#displayName').innerHTML = localStorage.getItem('displayName');
  // document.querySelector('#display-channel-section').innerHTML = localStorage.getItem('currentChannel');

  // if (!localStorage.getItem('currentChannel')) {
  //   localStorage.setItem('currentChannel', '#general');
  // }

  let currentChannel = '#general';
  joinChannel(currentChannel);
  document.querySelector('#currentChannel').innerHTML = currentChannel;

  // Add new channel in the channel section
  socket.on('add channel', data => {
    if (data) {
      const p = document.createElement('p');
      p.setAttribute('class','select-channel')
      // p.classList.add("select-channel");
      p.innerHTML = "#" + data ;
      document.querySelector('#display-channel-section').append(p);
    }
  })

  // Add new message in the message section
  socket.on('new message', data => {
    if (data) {
      console.log(data['channel'], data['message'])
      message = data['message']
      timeStamp = data['timeStamp']
      displayName = data['displayName']
      const p = document.createElement('p');
      const hr = document.createElement('hr');
      const span_timeStamp = document.createElement('span');
      const span_displayName = document.createElement('span');
      const br = document.createElement('br');
      span_displayName.innerHTML = displayName;
      span_timeStamp.innerHTML = timeStamp;
      p.innerHTML = span_displayName.outerHTML + br.outerHTML + message + br.outerHTML + span_timeStamp.outerHTML + hr.outerHTML;
      document.querySelector('#display-message-section').append(p);
    }
  })

  // channel selection
  document.querySelectorAll('.select-channel').forEach(p => {
    p.onclick = () => {
      document.querySelector('#currentChannel').innerHTML = p.innerHTML;
      let newChannel = p.innerHTML;
      if (newChannel == currentChannel) {
        message = `You are already in ${currentChannel} channel`
        printSysMsg(message)
      } else {
        leaveChannel(currentChannel);
        joinChannel(newChannel);
        currentChannel = newChannel;
      }
    }
  })

  socket.on('message', data => {
    printSysMsg(data['message'])
  })

  // Send new channel to the server
  document.querySelector('#send-channel').onclick = () => {
    if (document.querySelector('#new-channel').value) {
      socket.emit('new channel', {'channel': document.querySelector('#new-channel').value});
      document.querySelector('#new-channel').value = '';
    }
  }

  // Send message
  document.querySelector('#send-message').onclick = () => {
    console.log(currentChannel, localStorage.getItem('displayName'))
    if (document.querySelector('#user-message').value) {
      socket.emit('incoming msg', {'message': document.querySelector('#user-message').value,
                                    'displayName': localStorage.getItem('displayName'),
                                    'channel': currentChannel
                                  });
      document.querySelector('#user-message').value = '';
    }
  }

  // Leave Channel
  function leaveChannel(currentChannel) {
    socket.emit('leave', {'displayName':localStorage.getItem('displayName'), 'channel': currentChannel})
    console.log('Channel left', currentChannel)
  }

  // Join Channel
  function joinChannel(currentChannel) {
    socket.emit('join', {'displayName':localStorage.getItem('displayName'), 'channel': currentChannel})
    // Clear message selection
    document.querySelector('#display-message-section').innerHTML = '';
    console.log('Channel joined', currentChannel)
  }

})

// Function to display "Display Name"
function display_name() {
  if (!localStorage.getItem('displayName')) {
    var displayName = prompt("Please enter your 'Display Name'");
    if (!displayName) {
      document.write("try again")
    } else{
      localStorage.setItem('displayName', displayName);
    };
  };
}



// Print System message
function printSysMsg(message) {
  const p = document.createElement('p');
  p.innerHTML = message;
  document.querySelector('#display-message-section').append(p);
}
