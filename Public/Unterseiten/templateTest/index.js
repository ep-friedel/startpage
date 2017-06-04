setTimeout(()=>{
	console.log("test");
},2000)



$(window).on('beforeunload', (e) => {
	console.log("hallo welt")
})

function test () {
	window.location.href += "#";
}

window.onhashchange = (a, b) => {
console.log(a,b);
}