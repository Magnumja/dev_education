import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { expandQuery, suggestTerms } from "@/lib/search/aliases";

describe("expandQuery", () => {
  it("traduz como a comunidade escreve para o termo do catálogo", () => {
    // Cada um destes devolvia zero resultados antes dos apelidos existirem.
    assert.equal(expandQuery("reactjs"), "react");
    assert.equal(expandQuery("nodejs"), "node.js");
    assert.equal(expandQuery("k8s"), "kubernetes");
    assert.equal(expandQuery("postgres"), "postgresql");
    assert.equal(expandQuery("js"), "javascript");
  });

  it("traduz palavra a palavra dentro de uma frase", () => {
    assert.equal(expandQuery("aprender k8s do zero"), "aprender kubernetes do zero");
  });

  it("preserva o que já está correto", () => {
    assert.equal(expandQuery("docker"), "docker");
    assert.equal(expandQuery("machine learning"), "machine learning");
  });

  it("ignora maiúsculas e espaços em volta", () => {
    assert.equal(expandQuery("  ReactJS  "), "react");
  });

  it("não altera busca vazia", () => {
    assert.equal(expandQuery(""), "");
  });
});

describe("suggestTerms", () => {
  it("sugere o termo certo para erro de digitação", () => {
    assert.deepEqual(suggestTerms("pyton", 1), ["python"]);
    assert.deepEqual(suggestTerms("dockr", 1), ["docker"]);
    assert.deepEqual(suggestTerms("kubernets", 1), ["kubernetes"]);
  });

  it("não sugere nada para texto sem sentido", () => {
    // Sugerir qualquer coisa aqui seria pior que não sugerir: manda a pessoa
    // para um assunto que ela não procurou.
    assert.deepEqual(suggestTerms("asdfgh"), []);
  });

  it("ignora entrada curta demais para comparar", () => {
    assert.deepEqual(suggestTerms("ab"), []);
  });
});
