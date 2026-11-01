/* Dados da barbearia. Para um cliente novo, edite só este arquivo.
   fo = dia da folga (0 domingo ... 6 sábado) ou '' para nenhum. i/f = início/fim do expediente em minutos (540 = 09:00).
   whatsapp = número com país e DDD, só dígitos. O modo de teste usa os 3 primeiros barbeiros. */
window.NAVALHA_CONFIG = {
  nome: 'Navalha.co',
  endereco: 'Rua das Flores, 120 (endereço fictício)',
  whatsapp: '5586999999999',
  regras: { sinal: 20, noshow: 100, remarc: 50 },
  barbeiros: [
    { id: 'rafael', n: 'Rafael', i: 540, f: 1080, fo: '' },
    { id: 'diego', n: 'Diego', i: 540, f: 1080, fo: '' },
    { id: 'caio', n: 'Caio', i: 600, f: 1140, fo: '1' }
  ],
  cortes: [
    { id: 'degrade-baixo', n: 'Degradê baixo', e: 'degrade', m: 35, p: 4500, c: ['#ecd493', '#3a2c12'] },
    { id: 'social', n: 'Social clássico', e: 'classico', m: 30, p: 4000, c: ['#b48a3c', '#17130d'] },
    { id: 'moicano', n: 'Moicano', e: 'moderno', m: 45, p: 5500, c: ['#d4af5f', '#241a0a'] },
    { id: 'americano', n: 'Americano', e: 'classico', m: 30, p: 4000, c: ['#8f6b22', '#0b0a08'] },
    { id: 'pompadour', n: 'Pompadour', e: 'moderno', m: 50, p: 6000, c: ['#ecd493', '#8f6b22'] },
    { id: 'rente', n: 'Rente na navalha', e: 'degrade', m: 40, p: 5000, c: ['#17130d', '#d4af5f'] }
  ]
};
