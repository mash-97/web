
let submit = document.getElementById("submit");
let first_name = document.getElementById("first_name");
let email = document.getElementById("email");
let password = document.getElementById("password");

function trim_value(element) {
	element.value = element.value.trim();
}

first_name.onchange = ()=> trim_value(first_name);
email.onchange = ()=> trim_value(email);

submit.onclick = (event)=>{
  event.preventDefault();
  
  if(first_name.value.length==0 || email.value.length==0 || password.value.length==0)
    alert("Fields can't be empty");
}
