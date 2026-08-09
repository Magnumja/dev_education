import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalize, scoreResource, tokenize } from "@/lib/ranking/score";
import type { SearchResult } from "@/types";

function resource(overrides: Partial<SearchResult> = {}): SearchResult {
  return {
    id: "x",
    title: "Docker para iniciantes",
    description: "Aprenda containers do zero.",
    url: "https://exemplo.com/docker",
    source: "Exemplo",
    sourceDomain: "exemplo.com",
    type: "documentation",
    difficulty: "beginner",
    language: "pt",
    thumbnailUrl: null,
    author: null,
    publishedAt: null,
    isVerified: false,
    topics: ["docker"],
    tags: ["containers"],
    ...overrides,
  };
}

describe("normalize", () => {
  it("remove acento e caixa, para 'exercicio' achar 'exercício'", () => {
    assert.equal(normalize("Exercícios Práticos"), "exercicios praticos");
  });
});

describe("tokenize", () => {
  it("descarta palavras de uma letra e preserva sinais técnicos", () => {
    assert.deepEqual(tokenize("a node.js e c++"), ["node.js", "c++"]);
  });
});

describe("scoreResource", () => {
  it("prioriza título exato sobre correspondência parcial", () => {
    const exato = scoreResource(resource({ title: "Docker" }), "Docker");
    const parcial = scoreResource(resource({ title: "Guia de Docker" }), "Docker");

    assert.ok(
      exato > parcial,
      `título exato (${exato}) deveria vencer o parcial (${parcial})`,
    );
  });

  it("dá vantagem a conteúdo revisado pela curadoria", () => {
    const revisado = scoreResource(resource({ isVerified: true }), "docker");
    const cru = scoreResource(resource({ isVerified: false }), "docker");

    assert.ok(revisado > cru, "o selo de revisão precisa pesar no ranking");
  });

  it("dá vantagem a fonte oficial sobre agregador", () => {
    const oficial = scoreResource(
      resource({ sourceDomain: "docs.docker.com" }),
      "docker",
    );
    const qualquer = scoreResource(
      resource({ sourceDomain: "blogaleatorio.com" }),
      "docker",
    );

    assert.ok(oficial > qualquer, "documentação oficial precisa vir na frente");
  });

  it("considera avaliação dos usuários", () => {
    const bem = scoreResource(resource(), "docker", { rating: 5 });
    const sem = scoreResource(resource(), "docker", { rating: null });

    assert.ok(bem > sem);
  });

  it("prefere o recente entre iguais, sem punir conteúdo sem data", () => {
    const agora = new Date().toISOString();
    const antigo = new Date(Date.now() - 4 * 365 * 86400_000).toISOString();

    const novo = scoreResource(resource({ publishedAt: agora }), "docker");
    const velho = scoreResource(resource({ publishedAt: antigo }), "docker");
    const semData = scoreResource(resource({ publishedAt: null }), "docker");

    assert.ok(novo > velho, "conteúdo recente precisa vir na frente");
    assert.equal(
      velho,
      semData,
      "documentação atemporal não pode perder para a falta de data",
    );
  });

  it("busca vazia ainda ordena por qualidade", () => {
    const revisado = scoreResource(resource({ isVerified: true }), "");
    const cru = scoreResource(resource({ isVerified: false }), "");

    assert.ok(revisado > cru);
  });
});
