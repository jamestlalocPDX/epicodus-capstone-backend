const isEmpty = (string) => {
  if(string.trim() == '') {
    return true;
  } else {
    return false;
  }
}
const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if(email.match(regEx)) {
    return true;
  } else {
    return false;
  }
}

exports.validateSignupData = (data) => {
  let errors = {};
  // <---- Checks to see if email string is empty or has valid chars ---->
    if(isEmpty(data.email)) {
      errors.email = 'Please provide an email.';
    } else if (!isEmail(data.email)) {
      errors.email = 'Please enter a valid email address.';
    }
  
  // <---- Checks to see if password is empty ---->
    if(isEmpty(data.password)) {
      errors.password = 'Please enter a password.';
    }
    if(data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Both passwords must be the same!';
    }
  
  // <----Checks to see if the user handle is empty ---->
    if (isEmpty(data.handle)) {
      errors.handle = "Please enter a user handle."
    }
    
    return {
      errors,
      valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.validateLoginData = (data) => {
  let errors = {};

// <---- Checks to see if email string is empty ---->
  if(isEmpty(user.email)) {
    errors.email = "Please enter an email."
  }

// <---- Checks to see if password is empty ---->
  if(isEmpty(user.password)) {
    errors.password = "Please enter a password."
  }

// <----Checks to see if the user handle is empty ---->
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  }
}