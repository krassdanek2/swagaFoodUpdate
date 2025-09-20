async function goWheel(){
    document.querySelector('.wheel').style.animationName = "spin";
    setTimeout(() => {
        document.querySelector('.popup-cont').style.display = "flex";
    }, 17000);
}