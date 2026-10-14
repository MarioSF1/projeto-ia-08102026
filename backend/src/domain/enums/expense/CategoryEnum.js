const CategoryEnum = Object.freeze({
  ALIMENTACAO: 'Alimentação',
  TRANSPORTE: 'Transporte',
  MORADIA: 'Moradia',
  LAZER: 'Lazer',
  SAUDE: 'Saúde',
  EDUCACAO: 'Educação',
  COMPRAS: 'Compras',
  OUTROS: 'Outros',

  values() {
    return [
      this.ALIMENTACAO,
      this.TRANSPORTE,
      this.MORADIA,
      this.LAZER,
      this.SAUDE,
      this.EDUCACAO,
      this.COMPRAS,
      this.OUTROS,
    ];
  },

  isValid(value) {
    return this.values().includes(value);
  },
});

module.exports = { CategoryEnum };
