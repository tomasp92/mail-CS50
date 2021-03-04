document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email(mailid) {

  // Show compose view and hide other views
  document.querySelector('#view-email').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  console.log(mailid);

  if(mailid !==undefined){
  fetch(`emails/${mailid}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);
    console.log(email.subject.substr(0,3))

    // If its a replying mail use Reply values
    const mail = email;
    document.querySelector('#compose-recipients').value = mail.sender;
    if(email.subject.substr(0,3) === "Re:"){
      document.querySelector('#compose-subject').value = mail.subject;
    }else{
      document.querySelector('#compose-subject').value = `Re: ${mail.subject}`;
    }
    
    document.querySelector('#compose-body').value = `
    On ${mail.timestamp} ${mail.sender} wrote:
    ${mail.body}`;
});

  }
    

  // Send the mail 
  document.querySelector('#compose-form').onsubmit = function(){
    const sender = document.querySelector('#sender').value; 
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
    console.log(sender);
    console.log(recipients);
    console.log(subject);
    console.log(body);
    
    // Fetch using the post method to send the mail to the API
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        
    });
    load_mailbox('sent');
    return false;
  };
  
  

}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails to console
      console.log(emails);
  
      // For each mail create a div 
      const mails = emails;
      mails.forEach(function (mails){
        
        const element = document.createElement('div');
        element.className = "row"

        // For recived mails
        if(mailbox !== "sent"){
          document.querySelector('#Archive').style.display = 'block';
          element.innerHTML = `<div class="col-2">${mails.sender}</div> <div class="col-7">${mails.subject}</div> <div class="col-3"> ${mails.timestamp}</div>`;
          
          // Set the back ground color of read mails to grey
          if (mails.read === false){
            element.style = "background-color: white";
          } else{
            element.style = "background-color: grey";
          }
        
        } else {
          document.querySelector('#Archive').style.display = 'none';
          element.innerHTML = `<div class="col-2">${mails.recipients}</div> <div class="col-7"> ${mails.subject}</div> <div class="col-3"> ${mails.timestamp}</div>`;
        }
        
        // On click load this particular mail
        element.addEventListener('click', function(){
          load_email(mails.id, mailbox);
        });
         
        document.querySelector('#emails-view').append(element);

      });
         
  });
  
}


function load_email(mailsid, mailbox){

// Show the particular email and hide other views
document.querySelector('#view-email').style.display = 'block';
document.querySelector('#emails-view').style.display = 'none';
document.querySelector('#compose-view').style.display = 'none';

fetch(`emails/${mailsid}`)
.then(response => response.json())
.then(email => {
  // Print email
  console.log(email);
  const mail = email;        
  // Show the email 
  document.querySelector('#maildata').innerHTML = `<div><strong> From: </strong> ${ mail.sender} </div> 
  <div><strong> To: </strong> ${mail.recipients} </div> <div><strong> Subject: </strong> ${mail.subject} </div>
  <div> ${mail.timestamp} </div>`
  
  document.querySelector('#mailbody').innerHTML = mail.body
  

  // mark the email as read
  fetch(`emails/${mailsid}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
      })
    })

  // Reply button
  document.querySelector('#reply_button').addEventListener('click', function(){
    compose_email(mailsid);
  });
    
  //  Archive or Unarchive button  
  if(mailbox !== "sent"){
    const button = document.querySelector('#Archive')
    if(mail.archived){
      button.innerHTML = "Unarchive";
      button.addEventListener('click', function(){
        fetch(`emails/${mailsid}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: false
            })
          });   
          window.location.href="";
        });
    }else {
      button.innerHTML = "Archive";
      button.addEventListener('click', function(){
        fetch(`emails/${mailsid}`, {
          method: 'PUT',
          body: JSON.stringify({
          archived: true
          })
        });
        window.location.href="";
      });
    }

  }

  });
  
}


