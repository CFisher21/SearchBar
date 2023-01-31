 
function openMenu() {
  const navbarLinks = document.getElementsByClassName('navbar-links')[0]

  if(navbarLinks.style.display === "flex") {
    navbarLinks.style.display = "none";
  } else {
    navbarLinks.style.display = "flex";
  }
}

