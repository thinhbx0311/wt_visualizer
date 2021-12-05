//Movement Animation to happen
const card = document.querySelector(".card");
const card2 = document.querySelector(".card2");
const container = document.querySelector(".container");
const container2 = document.querySelector(".container2");
//Items
const title = document.querySelector(".title");
const sneaker = document.querySelector(".chicken img");
const purchase = document.querySelector(".purchase");
const description = document.querySelector(".info h3");
const sizes = document.querySelector(".sizes");


//Nướng Gà

const banhbao = document.querySelector(".dumpling img");
const title2 = document.querySelector(".info h4");
//Moving Animation Event
container.addEventListener("mousemove", (e) => {
	let xAxis = (window.innerWidth / 2 - e.pageX) / 25;
	let yAxis = (window.innerHeight / 2 - e.pageY) / 25;
	card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
});
container.addEventListener("click", (e) => {
	NuongGa(1);
  $("#corner-button-top").css("display", "none");
  $(".button-bottom").toggleClass("button-bottom-hide");
});
container2.addEventListener("click", (e) => {
	BanhBao(1);
	$("#corner-button-top").css("display", "none");
	$(".button-bottom").toggleClass("button-bottom-hide");
});
//Animate In
container.addEventListener("mouseenter", (e) => {
	card.style.transition = "none";
	//Popout
	title.style.transform = "translateZ(150px)";
	sneaker.style.transform = "translateZ(200px) rotateZ(-45deg)";
});
//Animate Out
container.addEventListener("mouseleave", (e) => {
	card.style.transition = "all 0.5s ease";
	card.style.transform = `rotateY(0deg) rotateX(0deg)`;
	//Popback
	title.style.transform = "translateZ(0px)";
	sneaker.style.transform = "translateZ(0px) rotateZ(0deg)";
});

//Moving Animation Event
container2.addEventListener("mousemove", (e) => {
	let xAxis2 = (window.innerWidth / 2 - e.pageX) / 25;
	let yAxis2 = (window.innerHeight / 2 - e.pageY) / 25;
	card2.style.transform = `rotateY(${xAxis2}deg) rotateX(${-yAxis2}deg)`;
});
//Animate In
container2.addEventListener("mouseenter", (e) => {
	card2.style.transition = "none";
	//Popout
	title2.style.transform = "translateZ(150px)";
	banhbao.style.transform = "translateZ(200px) rotateZ(45deg)";
});
//Animate Out
container2.addEventListener("mouseleave", (e) => {
	card2.style.transition = "all 0.5s ease";
	card2.style.transform = `rotateY(0deg) rotateX(0deg)`;
	//Popback
	title2.style.transform = "translateZ(0px)";
	banhbao.style.transform = "translateZ(0px) rotateZ(0deg)";
});
