var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Armazenador } from "./Armazenador.js";
import { ValidaDebito, ValidaDeposito } from "./Decorators.js";
import { TipoTransacao } from "./TipoTransacao.js";
export class Conta {
    nome;
    saldo = Armazenador.obter('saldo') || 0; // JSON.parse(localStorage.getItem("saldo")) || 0;
    transacoes = Armazenador.obter(("transacoes"), (key, value) => {
        if (key === "data") {
            return new Date(value);
        }
        return value;
    }) || [];
    constructor(nome) {
        this.nome = nome;
    }
    getTitular() {
        this.nome;
    }
    getGruposTransacoes() {
        const gruposTransacoes = [];
        const listaTransacoes = structuredClone(this.transacoes);
        const transacoesOrdenadas = listaTransacoes.sort((t1, t2) => t2.data.getTime() - t1.data.getTime());
        let labelAtualGrupoTransacao = "";
        for (let transacao of transacoesOrdenadas) {
            let labelGrupoTransacao = transacao.data.toLocaleDateString("pt-br", { month: "long", year: "numeric" });
            if (labelAtualGrupoTransacao !== labelGrupoTransacao) {
                labelAtualGrupoTransacao = labelGrupoTransacao;
                gruposTransacoes.push({
                    label: labelGrupoTransacao,
                    transacoes: []
                });
            }
            gruposTransacoes.at(-1).transacoes.push(transacao);
        }
        return gruposTransacoes;
    }
    getSaldo() {
        return this.saldo;
    }
    getDataAcesso() {
        return new Date();
    }
    registrarTransacao(novaTransacao) {
        if (novaTransacao.tipoTransacao == TipoTransacao.DEPOSITO) {
            this.depositar(novaTransacao.valor);
        }
        else if (novaTransacao.tipoTransacao == TipoTransacao.TRANSFERENCIA || novaTransacao.tipoTransacao == TipoTransacao.PAGAMENTO_BOLETO) {
            this.debitar(novaTransacao.valor);
            novaTransacao.valor *= -1;
        }
        else {
            throw new Error("Tipo de Transação é inválido!");
        }
        this.transacoes.push(novaTransacao);
        console.log(this.getGruposTransacoes());
        // localStorage.setItem("transacoes", JSON.stringify(this.transacoes));
        Armazenador.salvar("transacoes", JSON.stringify(this.transacoes));
    }
    debitar(valor) {
        // if (valor <= 0) {
        //     throw new Error("O valor a ser debitado deve ser maior que zero!");
        // }
        // if (valor > this.saldo) {
        //     throw new Error("Saldo insuficiente!");
        // } --> Não precisa mais validar por aqui, pois o decorator já faz isso.
        this.saldo -= valor;
        // localStorage.setItem("saldo", this.saldo.toString());
        Armazenador.salvar("saldo", this.saldo.toString());
    }
    depositar(valor) {
        // if (valor <= 0) {
        //     throw new Error("O valor a ser depositado deve ser maior que zero!");
        // } --> Não precisa mais validar por aqui, pois o decorator já faz isso.
        this.saldo += valor;
        // localStorage.setItem("saldo", this.saldo.toString());
        Armazenador.salvar("saldo", this.saldo.toString());
    }
}
__decorate([
    ValidaDebito //decorator
], Conta.prototype, "debitar", null);
__decorate([
    ValidaDeposito //decorator
], Conta.prototype, "depositar", null);
export class ContaPremium extends Conta {
    registrarTransacao(transacao) {
        if (transacao.tipoTransacao === TipoTransacao.DEPOSITO) {
            console.log("Ganhou um bônus de 0,50 centavos!");
            transacao.valor += 0.5;
        }
        // this.registrarTransacao(transacao);
        super.registrarTransacao(transacao);
    }
}
const conta = new Conta("Joana da Silva Olveira");
const contaPremium = new ContaPremium("Mylena Marques Ribeiro");
export default conta;
