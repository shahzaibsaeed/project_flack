// a function to create Prompt for user to enter DISPLAY NAME
function display_name() {
  if (!localStorage.getItem('displayName')) {
    var displayName = prompt("Please enter your 'Username'");
    if (!displayName) {
      document.write("try again")
    } else{
      localStorage.setItem('displayName', displayName);
    };
  };
};


// Load the DOM
document.addEventListener('DOMContentLoaded', () => {

  // load the DISPLAY_NAME function to prompt the input field
  display_name();

  document.querySelector('#displayName').innerHTML = localStorage.getItem('displayName');
});
