
// Load the DOMs
document.addEventListener('DOMContentLoaded', () => {

  // connects to the socket
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);


  // load the DISPLAY_NAME function to prompt the input field
  display_name();

  document.querySelector('#displayName').innerHTML = localStorage.getItem('displayName');

  let channel = "General";
  joinChannel("General");

  // display all incoming mdocument.addEventListener('DOMContentLoaded', () => {
  // Connect to websocket
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  // load the DISPLAY_NAME function to prompt the input field
  display_name();
  var displayName = localStorage.getItem('displayName');
  document.querySelector('#displayName').innerHTML = displayName;

  // Load the channel list
  let currentChannel = 'general';
  document.querySelector('#currentChannel').innerHTML = currentChannel;

  // join the a channel when opens the app
  joinChannel(currentChannel);


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


  // Add announcment about joining the new channel
  socket.on('joinChannelAnnouncement', data => {
    const p = document.createElement('p');
    p.innerHTML = `${data['displayName']} has joined the '${data['channel']}'`
    document.querySelector('#display-message-section').append(p);

  })

  // Add announcment about leaving the new channel
  socket.on('leaveChannelAnnouncement', data => {
    const p = document.createElement('p');
    p.innerHTML = `${data['displayName']} has left the '${data['channel']}'`
    document.querySelector('#display-message-section').append(p);

  })

  // Add new message in the message section
  socket.on('new message', data => {
    // display current messages
    if (data['message']) {
      // create elements
      const p = document.createElement('p');
      const span_timeStamp = document.createElement('span');
      const span_displayName = document.createElement('span');
      const br = document.createElement('br');
      const hr = document.createElement('hr');

      message = data['message']
      timeStamp = data['timeStamp']
      displayName = data['displayName']

    // display own message
    if (data['displayName'] == displayName){
      console.log(`${data['displayName']} has sent '${data['message']}' in channel '${data['channel']}'`);
      span_displayName.innerHTML = displayName;
      span_timeStamp.innerHTML = timeStamp;
      p.innerHTML = span_displayName.outerHTML + br.outerHTML + message + br.outerHTML + span_timeStamp.outerHTML + hr.outerHTML;
      document.querySelector('#display-message-section').append(p);
    } else if (typeof data['displayName'] !== 'undefined') {
      span_displayName.innerHTML = displayName;
      span_timeStamp.innerHTML = timeStamp;
      p.innerHTML = span_displayName.outerHTML + br.outerHTML + message + br.outerHTML + span_timeStamp.outerHTML + hr.outerHTML;
      document.querySelector('#display-message-section').append(p);
    }
    }
  })

  // Send message
  document.querySelector('#send-message').onclick = () => {
    if (document.querySelector('#user-message').value) {
      socket.emit('incoming msg', {'message': document.querySelector('#user-message').value,
                                    'displayName': displayName,
                                    'channel': currentChannel
                                  });

      document.querySelector('#user-message').value = '';
    }

  }

    // Send new channel to the server
  document.querySelector('#send-channel').onclick = () => {
    if (document.querySelector('#new-channel').value) {
      socket.emit('new channel', {'channel': document.querySelector('#new-channel').value});
      document.querySelector('#new-channel').value = '';
    }
  }

  // channel selection
  document.querySelectorAll('.select-channel').forEach(p => {
    p.onclick = () => {
      document.querySelector('#currentChannel').innerHTML = p.innerHTML;
      newChannel = p.innerHTML;
      console.log(`current channel is '${newChannel}', user is ${displayName}`);
      leaveChannel(currentChannel);
      joinChannel(newChannel);
      currentChannel = newChannel;
      document.querySelector('#display-message-section').innerHTML = '';
    }
  })

  // Join Channel
  function joinChannel(newChannel) {
    socket.emit('join', {'displayName': displayName, 'channel': newChannel});
    console.log(`channel '${newChannel}' joined by ${displayName}`);
  }

  // leave Channel
  function leaveChannel(currentChannel) {
    socket.emit('leave', {'displayName': displayName, 'channel': currentChannel});
    console.log(`channel '${currentChannel}' left by ${displayName}`);
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
essages on the client-side
  socket.on('message', data => {

    // display current messages
    if (data.message) {
      // create elements
      const p = document.createElement('p');
      const span_displayName = document.createElement('span');
      const span_timeStamp = document.createElement('span');
      const br = document.createElement('br');

      // display own message
      if (data.displayName == localStorage.getItem('displayName')) {
        // create a displayName span
        span_displayName.innerHTML = data.displayName;
        // create a timeStamp span
        span_timeStamp.innerHTML = data.timeStamp;
        // create a text paragraph
        p.innerHTML = span_displayName.outerHTML + br.outerHTML + data.message + br.outerHTML + span_timeStamp.outerHTML;

        // add the text line in Display message section
        document.querySelector('#display-message-section').append(p);
      } else if (typeof data.displayName !== 'undefined') {
        // create a displayName span
        span_displayName.innerHTML = data.displayName;
        // create a timeStamp span
        span_timeStamp.innerHTML = data.timeStamp;
        // create a text paragraph
        p.innerHTML = span_displayName.outerHTML + br.outerHTML + data.message + br.outerHTML + span_timeStamp.outerHTML;

        // add the text line in Display message section
        document.querySelector('#display-message-section').append(p);
      }
      else {
        printSysMsg(data.message);
      }
    }

  });

  // sending message to the server
  document.querySelector('#send-message').onclick = () => {
    socket.send({"message": document.querySelector('#user-message').value,
      "displayName" : localStorage.getItem('displayName'),
      "channel": channel});
    // clear input field
    document.querySelector('#user-message').value = '';
  };

  // channel selection
  document.querySelectorAll('.select-channel').forEach(p => {
    p.onclick = () => {
      let newChannel = p.innerHTML;
      if (newChannel == channel) {
        message = `You are already in ${channel} channel.`
        printSysMsg(message)
      } else {
        leaveChannel(channel);
        joinChannel(newChannel);
        channel = newChannel;
      };
    };
  });

  // a function to create Prompt for user to enter DISPLAY NAME
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
  // leave channel
  function leaveChannel(channel) {
    socket.emit('leave', {"displayName": localStorage.getItem('displayName'), "channel": channel});
    console.log("leave")
  }
  // leave channel
  function joinChannel(channel) {
    socket.emit('join', {"displayName": localStorage.getItem('displayName'), "channel": channel});
    // clear message area
    document.querySelector('#display-message-section').innerHTML = '';
    // autofocus on text box
    document.querySelector('#user-message').focus()
    console.log('join')
  }
  // print system message
  function printSysMsg(message) {
    const p = document.createElement('p');
    p.innerHTML = message;
    document.querySelector('#display-message-section').append(p);
  }


});
