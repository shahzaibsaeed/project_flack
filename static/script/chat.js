                                                // PROJECT (FLACK) WAS STARTED ON 3rd July, 2020, code written by "Shahzaib Saeed"

document.addEventListener('DOMContentLoaded', () => {
  // Connect to websocket
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  // load the DISPLAY_NAME function to prompt the input field
  display_name();
  var displayName = localStorage.getItem('displayName');
  document.querySelector('#displayName').innerHTML = displayName;

  if (!localStorage.getItem('currentChannel')) {
    localStorage.setItem('currentChannel', '#general');
  }

  // Load the channel list
  let currentChannel = localStorage.getItem('currentChannel');
  document.querySelector('#currentChannel').innerHTML = currentChannel;

  // join the a channel when opens the app
  joinChannel(currentChannel);
  oldMsgs(currentChannel);


  // requesting old messages
  function oldMsgs(currentChannel) {
    socket.emit('old msgs', {'currentChannel': currentChannel, 'displayName': localStorage.getItem('displayName')});
    console.log(`old msgs for channel '${currentChannel}' by '${displayName}'`)
  }

  // display old messages
  socket.on('display old msgs', data => {
    if (data['currentChannel'] == currentChannel && data['displayName'] == localStorage.getItem('displayName')) {


      console.log(data)

      for (var i=0; i < (data['messages']['messages']).length; i++) {

        const p = document.createElement('p');
        const p_msg = document.createElement('p');
        const span_timeStamp = document.createElement('span');
        const span_displayName = document.createElement('span');
        const br = document.createElement('br');
        const hr = document.createElement('hr');

        console.log(data['messages']['messages'][i]);
        console.log(data['messages']['displayName'][i]);
        // display own message
        if (data['messages']['displayName'][i] == localStorage.getItem('displayName')){
          p.setAttribute("class", "my-msg");
          message = data['messages']['messages'][i]
          timeStamp = data['messages']['timeStamp'][i]
          displayName = data['messages']['displayName'][i]

          span_displayName.setAttribute("class", "my-displayName");
          span_displayName.innerHTML = displayName;

          p_msg.innerHTML = message

          span_timeStamp.setAttribute("class", "timestamp");
          span_timeStamp.innerHTML = timeStamp;

          p.innerHTML = span_timeStamp.outerHTML + br.outerHTML + p_msg.outerHTML;
          document.querySelector('#display-message-section').append(p);
          console.log(`msg ${message} send by ${data['messages']['displayName'][i]}`)
        } else if (typeof data['messages']['displayName'][i] !== 'undefined') {

          const p = document.createElement('p');
          const p_msg = document.createElement('p');
          const span_timeStamp = document.createElement('span');
          const span_displayName = document.createElement('span');
          const br = document.createElement('br');
          const hr = document.createElement('hr');


          p.setAttribute("class", "others-msg");
          message = data['messages']['messages'][i]
          timeStamp = data['messages']['timeStamp'][i]
          displayName = data['messages']['displayName'][i]

          span_displayName.setAttribute("class", "other-displayName");
          span_displayName.innerHTML = displayName;

          p_msg.innerHTML = span_displayName.outerHTML + br.outerHTML + message

          span_timeStamp.setAttribute("class", "timestamp");
          span_timeStamp.innerHTML = timeStamp;

          p.innerHTML = span_timeStamp.outerHTML + br.outerHTML + p_msg.outerHTML;
          document.querySelector('#display-message-section').append(p);
          console.log(`msg ${message} send by ${data['messages']['displayName'][i]}`)
        }
      }

      }
      scrollDownChatWindow();
  })






  // Add new channel in the channel section
  socket.on('add channel', data => {
    if (data) {
      const p = document.createElement('p');
      p.className = 'select-channel'
      p.innerHTML = '#' + data ;
      document.querySelector('#display-channel-section').append(p);
    }
  })


  // Add announcment about joining the new channel
  socket.on('joinChannelAnnouncement', data => {
    const p = document.createElement('p');
    p.setAttribute("class", "system-msg");
    p.innerHTML = `${data['displayName']} has joined the '${data['channel']}'`
    document.querySelector('#display-message-section').append(p);
    scrollDownChatWindow();
  })

  // Add announcment about leaving the new channel
  socket.on('leaveChannelAnnouncement', data => {
    const p = document.createElement('p');
    p.setAttribute("class", "system-msg");
    p.innerHTML = `${data['displayName']} has left the '${data['channel']}'`
    document.querySelector('#display-message-section').append(p);
    scrollDownChatWindow();
  })

  // Add new message in the message section
  socket.on('new message', data => {
    // display current messages
    if (data['message']) {
      // create elements
      const p = document.createElement('p');
      const p_msg = document.createElement('p');
      const span_timeStamp = document.createElement('span');
      const span_displayName = document.createElement('span');
      const br = document.createElement('br');
      const hr = document.createElement('hr');
      console.log(`data coming for ${data['displayName']}`)

    // display own message
    if (data['displayName'] == localStorage.getItem('displayName')){
      p.setAttribute("class", "my-msg");
      message = data['message']
      timeStamp = data['timeStamp']
      displayName = data['displayName']

      span_displayName.setAttribute("class", "my-displayName");
      span_displayName.innerHTML = displayName;

      p_msg.innerHTML = message

      span_timeStamp.setAttribute("class", "timestamp");
      span_timeStamp.innerHTML = timeStamp;

      p.innerHTML = span_timeStamp.outerHTML + br.outerHTML + p_msg.outerHTML;
      document.querySelector('#display-message-section').append(p);
      console.log(`msg ${message} send by ${data['displayName']}`)
    } else if (typeof data['displayName'] !== 'undefined') {
      p.setAttribute("class", "others-msg");
      message = data['message']
      timeStamp = data['timeStamp']
      displayName = data['displayName']

      span_displayName.setAttribute("class", "other-displayName");
      span_displayName.innerHTML = displayName;

      p_msg.innerHTML = span_displayName.outerHTML + br.outerHTML + message

      span_timeStamp.setAttribute("class", "timestamp");
      span_timeStamp.innerHTML = timeStamp;

      p.innerHTML = span_timeStamp.outerHTML + br.outerHTML + p_msg.outerHTML;
      document.querySelector('#display-message-section').append(p);
      console.log(`msg ${message} send by ${data['displayName']}`)
    }
    }
    scrollDownChatWindow();
  })


  // User typing
  socket.on('typing', data => {
    if (data['channel'] == localStorage.getItem('currentChannel')) {
      if (data['usernames'].length == 0 || data['usernames'][0] == localStorage.getItem('displayName') && data['usernames'].length == 1) {
        $("#typingUsersText").html('');
        $(".typingUsers").css("display", "none");
      } else {
        $("#typingUsersText").html('');
        data['usernames'].forEach(function (username) {
          if (username !== localStorage.getItem('displayName')) {
            $("#typingUsersText").append(`${username}, `);
          }
        });

        let temp = $("#typingUsersText").html().slice(0, -2);
        $("#typingUsersText").html(temp);
        if (data['usernames'].length == 1 || data['usernames'].length == 2 && data['usernames'].includes(localStorage.getItem('displayName'))) {
          $("#typingUsersText").append(" is typing...");
        } else {
          $("#typingUsersText").append(" are typing...");
        }
        $(".typingUsers").css("display", "block");
      }
    }
  });

  // Send message
  document.querySelector('#send-message').onclick = () => {
    if (document.querySelector('#user-message').value) {
      socket.emit('incoming msg', {'message': document.querySelector('#user-message').value,
                                    'displayName': localStorage.getItem('displayName'),
                                    'channel': currentChannel
                                  });
      console.log(`msg ${ document.querySelector('#user-message').value}} send by ${localStorage.getItem('displayName')}`)
      document.querySelector('#user-message').value = '';
    }

  }

    // Send new channel to the server
  document.querySelector('#form').onsubmit = () => {
    if (document.querySelector('#new-channel').value) {
      channel = document.querySelector('#new-channel').value;
      socket.emit('new channel', {'channel': channel});
      document.querySelector('#new-channel').value = '';
      channel_x = "#" + channel;
      joinChannel(channel_x);
    }
  }


  // channel selection
  document.querySelectorAll('.select-channel').forEach(p => {
    p.onclick = () => {
      document.querySelector('#currentChannel').innerHTML = p.innerHTML;
      newChannel = p.innerHTML;
      if (newChannel === currentChannel) {
        msg = `You are already in ${currentChannel}.`
        printSysMsg(msg);
      } else {
        leaveChannel(currentChannel);
        joinChannel(newChannel);
        oldMsgs(newChannel);
        currentChannel = newChannel;
        document.querySelector('#display-message-section').innerHTML = '';
        document.querySelector('#user-message').focus();
      }

    }
  })

  // Join Channel
  function joinChannel(newChannel) {
    socket.emit('join', {'displayName': displayName, 'channel': newChannel});
    localStorage.setItem('currentChannel', newChannel)
    console.log(`'${newChannel}' channel joined by '${displayName}'`)
  }

  // leave Channel
  function leaveChannel(currentChannel) {
    socket.emit('leave', {'displayName': displayName, 'channel': currentChannel});
    console.log(`'${currentChannel}' channel left by '${displayName}'`)

  }


  // Print system messages
  function printSysMsg(msg) {
    const p = document.createElement('p');
    p.setAttribute("class", "system-msg");
    p.innerHTML = msg;
    document.querySelector('#display-message-section').append(p);

    // Autofocus on text box
    document.querySelector("#user_message").focus();
    scrollDownChatWindow();
  }

  // Scroll chat window down
   function scrollDownChatWindow() {
       const chatWindow = document.querySelector("#display-message-section");
       chatWindow.scrollTop = chatWindow.scrollHeight;
   }

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

   // #Function to display user typing or not
   $('#user-message').bind('input propertychange', () => {
           socket.emit('type', {
               "status": "start",
               "channel": localStorage.getItem('currentChannel'),
               "username": localStorage.getItem('displayName')
           });

       });

       $("#user-message").blur(function () {
           socket.emit('type', {
               "status": "end",
               "channel": localStorage.getItem('currentChannel'),
               "username": localStorage.getItem('displayName')
           });
       });

})
