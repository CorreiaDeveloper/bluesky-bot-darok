import fs from 'fs';
import path from 'path';

// Constantes de custo
export const COST_POINTS_CREATE = 3;
export const COST_POINTS_UPDATE = 2;
export const COST_POINTS_DELETE = 1;

// Caminho para o arquivo points.json
const pointsFilePath = path.resolve('points.json');

// Função para carregar o conteúdo de points.json
const loadPoints = () => {
  if (!fs.existsSync(pointsFilePath)) {
    return {
      pointsThisHour: 0,
      dailyPointsUsed: 0,
      lastHourlyReset: 0,
      lastDailyReset: 0,
    };
  }
  
  const data = fs.readFileSync(pointsFilePath, 'utf-8');
  return JSON.parse(data);
};

// Função para salvar o conteúdo de points.json
const savePoints = (pointsData) => {
  fs.writeFileSync(pointsFilePath, JSON.stringify(pointsData, null, 2));
};

// Função para verificar se há pontos disponíveis para realizar uma ação
export const canAddPoints = (pointsToAdd) => {
  const pointsData = loadPoints();

  // Limites de pontos
  const MAX_POINTS_PER_HOUR = 5000;
  const MAX_POINTS_PER_DAY = 35000;

  const currentTime = Date.now();
  const oneHourInMs = 60 * 60 * 1000;
  const oneDayInMs = 24 * oneHourInMs;

  // Reseta os pontos por hora se uma hora tiver passado
  if (currentTime - pointsData.lastHourlyReset >= oneHourInMs) {
    pointsData.pointsThisHour = 0;
    pointsData.lastHourlyReset = currentTime;
  }

  // Reseta os pontos diários se 24 horas tiverem passado
  if (currentTime - pointsData.lastDailyReset >= oneDayInMs) {
    pointsData.pointsThisHour = 0;
    pointsData.dailyPointsUsed = 0;
    pointsData.lastHourlyReset = currentTime;
    pointsData.lastDailyReset = currentTime;
  }

  // Verifica se é possível adicionar mais pontos sem exceder os limites
  if (pointsData.pointsThisHour + pointsToAdd > MAX_POINTS_PER_HOUR || pointsData.dailyPointsUsed + pointsToAdd > MAX_POINTS_PER_DAY) {
    return false;
  }

  return true;
};

// Função para atualizar os pontos
export const updatePoints = (pointsToAdd) => {
  const pointsData = loadPoints();

  const currentTime = Date.now(); // Hora atual em milissegundos
  const oneHourInMs = 60 * 60 * 1000; // Uma hora em milissegundos
  const oneDayInMs = 24 * oneHourInMs; // Um dia em milissegundos

  // Verifica se passou mais de 1 hora desde o último reset por hora
  if (currentTime - pointsData.lastHourlyReset >= oneHourInMs) {
    pointsData.pointsThisHour = 0;
    pointsData.lastHourlyReset = currentTime;
  }

  // Verifica se passou mais de 24 horas desde o último reset diário
  if (currentTime - pointsData.lastDailyReset >= oneDayInMs) {
    pointsData.pointsThisHour = 0;
    pointsData.dailyPointsUsed = 0;
    pointsData.lastHourlyReset = currentTime;
    pointsData.lastDailyReset = currentTime;
  }

  // Atualiza os pontos
  pointsData.pointsThisHour += pointsToAdd;
  pointsData.dailyPointsUsed += pointsToAdd;

  // Salva os dados atualizados no arquivo
  savePoints(pointsData);
};
