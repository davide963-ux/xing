const SYM = { S: '♠', H: '♥', D: '♦', C: '♣' }
document.querySelectorAll('.c[data-r]').forEach((el) => {
  const r = el.dataset.r, s = el.dataset.s, sym = SYM[s]
  const big = ['A', 'J', 'Q', 'K'].includes(r)
  if (s === 'H' || s === 'D') el.classList.add('red')
  el.innerHTML = `<span class="k tl">${r}<small>${sym}</small></span><span class="m">${big ? r : sym}</span>${big ? `<span class="ms">${sym}</span>` : ''}<span class="k br">${r}<small>${sym}</small></span>`
})
document.querySelectorAll('.suits').forEach((el) => {
  el.innerHTML =
    '<i style="left:40px;top:60px">♠</i><i style="right:50px;top:300px">♥</i><i style="left:80px;top:760px">♦</i><i style="right:70px;top:1000px">♣</i><i style="left:420px;top:1150px">♠</i>'
})
