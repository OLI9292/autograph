const _ = require("underscore")
const mongoose = require("mongoose")
const Schema = mongoose.Schema
const { get } = require("lodash")

const db = require("../databases/accounts/index")

const { Question } = require("../models/question")

const isKorean = str =>
  str.split("").filter(s => "abcdefghijklmnopqrstuvwxyz".indexOf(s) > -1)
    .length === 0

const data = [
  "carnivore = 육식 동물 = 고기를 먹는 동물 = 고기를 (meat) 먹는 (eats) 동물",
  "herbivore = 초식 동물 = 식물을 먹는 동물 = 식물을 (plants) 먹는 (eats) 동물",
  "omnivore = 잡식 동물 = 모든 것을 먹는 동물 = 모든 것을 (all) 먹는 (eats) 동물",
  "tricycle = 세 발 자전거 = 바퀴가 세 개 달린 탈 것 = 바퀴가 (wheel) 세 (three) 개 달린 탈 것",
  "bicycle = 두 발 자전거  = 바퀴가 두 개 달린 탈 것 = 바퀴가 (wheel) 두 (two) 개 달린 탈 것",
  "biped = 두 발 짐승 = 다리가 두 개인 동물= 다리가 (leg) 두 (two) 개인 동물",
  "quadruped = 네발 짐승 = 다리가 네 개인 동물 = 다리가 (leg) 네 (four) 개인 동물",
  "centipede =  지네 = 다리가 (leg) 백 (hundred) 개인 벌레 = 다리가 (leg) 백 (hundred) 개인 벌레",
  "century = 세기 = 백 년의 기간 = 백 (hundred) 년의 기간",
  "millipede = 노래기 = 다리가 천 개인 벌레 = 다리가 (leg) 천 (thousand) 개인 벌레",
  "millennium = 천년 = 천 년의 기간 = 천 (thousand) 년의 (year) 기간",
  "tripod = 삼각대 = 다리가 세개 달린 받침대= 다리가 (leg) 세개 (three) 달린 받침대",
  "quadrilateral = 사각형 = 네 개의 선분으로 둘러싸인 도형 = 네 (four) 개의 선분으로 (side) 둘러싸인 도형",
  "bilateral = 쌍무적  = 양 쪽이 서로 의무른 지는 = 양 (two) 쪽이 (side) 서로 의무른 지는",
  "arthropod = 절지동물 = 각각의 다리에 관절이 있는 동물 = 각각의 다리에 (leg) 관절이 (joint) 있는 동물",
  "arthritis = 관절염 = 관절에 생기는 염증 = 관절에 (joints) 생기는 염증 (inflammation)",
  "arthroscope = 관절경 = 관절을 관찰하기 위한 내시경 = 관절을 (joint) 관찰하기 (see) 위한 내시경",
  "telescope = 망원경 = 멀리 있는 물체 따위를 크고 정확하게 보도록 만든 장치 = 멀리 (distant) 있는 물체 따위를 크고 정확하게 보도록 (see) 만든 장치",
  "telephone = 전화기 = 멀리 있는 사람이 서로의 소리를 드를 수 있게 만든 기계 = 멀리 (distant) 있는 사람이 서로의 소리를 (sounds) 드를 수 있게 만든 기계",
  "telepathy = 텔레파시 = 멀리 있는 다른 사람의 생각과 감정을 알수 있는 재능 = 멀리 (distant) 있는 다른 사람의 생각과 감정을 (feelings) 알수 있는 재능"
].map(d => {
  if (d.split("=").length !== 4) {
    throw new Error("Bad length " + d)
    process.exit(0)
  }
  const [word, koreanWord, normalDefinition, definition] = d.split("=")
  const split = definition.split(/\(|\)/)
  const easy = split.map(s => ({
    value: !isKorean(s) ? `(${s})` : s,
    highlight: !isKorean(s)
  }))

  const normal = [
    {
      value: normalDefinition,
      highlight: false
    }
  ]
  return {
    word: word.trim(),
    koreanWord,
    prompt: {
      normal,
      easy
    }
  }
})

const run = async () => {
  const keys = data.map(({ word }) => word.trim() + "-1")
  let docs = await Question.find({ key: { $in: keys } })
  docs = docs.map(d => JSON.parse(d.data))

  const questions = data.map(d => {
    const doc = docs.find(doc => doc.key === d.word + "-1")
    if (!doc) {
      throw new Error("cant find word " + d.word)
      process.exit(0)
    }
    const key = doc.key + "-korea"
    doc.key = key
    doc.koreanWord = d.koreanWord
    doc.prompt = d.prompt

    return {
      key,
      data: JSON.stringify(doc)
    }
  })

  const koreanKeys = questions.map(q => q.key)
  await Question.deleteMany({ key: { $in: koreanKeys } })
  const res = await Question.create(questions)

  process.exit(0)
}

run()
