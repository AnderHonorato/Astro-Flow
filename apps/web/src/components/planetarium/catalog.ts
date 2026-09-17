export type SkyObjectKind = 'estrela' | 'ceu-profundo' | 'planeta';

export type CatalogObject = {
  id: string;
  name: string;
  aliases: string[];
  kind: SkyObjectKind;
  ra?: number;
  dec?: number;
  magnitude?: number;
  constellation?: string;
  description: string;
};

export type Constellation = {
  id: string;
  name: string;
  lines: Array<[string, string]>;
};

export const NAMED_STARS: CatalogObject[] = [
  { id: 'sirius', name: 'Sírius', aliases: ['Sirius', 'Alpha Canis Majoris'], kind: 'estrela', ra: 6.7525, dec: -16.7161, magnitude: -1.46, constellation: 'Cão Maior', description: 'A estrela mais brilhante do céu noturno.' },
  { id: 'canopus', name: 'Canopus', aliases: ['Alpha Carinae'], kind: 'estrela', ra: 6.3992, dec: -52.6957, magnitude: -0.74, constellation: 'Carina', description: 'A segunda estrela mais brilhante do céu noturno.' },
  { id: 'arcturus', name: 'Arcturus', aliases: ['Arcturo', 'Alpha Bootis'], kind: 'estrela', ra: 14.261, dec: 19.1825, magnitude: -0.05, constellation: 'Boieiro', description: 'Gigante alaranjada muito brilhante no hemisfério norte.' },
  { id: 'vega', name: 'Vega', aliases: ['Alpha Lyrae'], kind: 'estrela', ra: 18.6156, dec: 38.7837, magnitude: 0.03, constellation: 'Lira', description: 'Uma das estrelas do Triângulo de Verão.' },
  { id: 'capella', name: 'Capella', aliases: ['Alpha Aurigae'], kind: 'estrela', ra: 5.2782, dec: 45.998, magnitude: 0.08, constellation: 'Cocheiro', description: 'Sistema estelar brilhante na constelação do Cocheiro.' },
  { id: 'rigel', name: 'Rigel', aliases: ['Beta Orionis'], kind: 'estrela', ra: 5.2423, dec: -8.2016, magnitude: 0.13, constellation: 'Órion', description: 'Supergigante azul que marca um dos pés de Órion.' },
  { id: 'procyon', name: 'Procyon', aliases: ['Alpha Canis Minoris'], kind: 'estrela', ra: 7.655, dec: 5.225, magnitude: 0.34, constellation: 'Cão Menor', description: 'Estrela brilhante próxima de Sírius e Betelgeuse.' },
  { id: 'betelgeuse', name: 'Betelgeuse', aliases: ['Alpha Orionis'], kind: 'estrela', ra: 5.9195, dec: 7.4071, magnitude: 0.42, constellation: 'Órion', description: 'Supergigante vermelha no ombro de Órion.' },
  { id: 'achernar', name: 'Achernar', aliases: ['Alpha Eridani'], kind: 'estrela', ra: 1.6286, dec: -57.2368, magnitude: 0.46, constellation: 'Erídano', description: 'Estrela azulada muito brilhante no céu austral.' },
  { id: 'altair', name: 'Altair', aliases: ['Alpha Aquilae'], kind: 'estrela', ra: 19.8464, dec: 8.8683, magnitude: 0.76, constellation: 'Águia', description: 'Uma das estrelas do Triângulo de Verão.' },
  { id: 'aldebaran', name: 'Aldebaran', aliases: ['Alpha Tauri'], kind: 'estrela', ra: 4.5987, dec: 16.5093, magnitude: 0.85, constellation: 'Touro', description: 'Gigante alaranjada que marca o olho do Touro.' },
  { id: 'antares', name: 'Antares', aliases: ['Alpha Scorpii'], kind: 'estrela', ra: 16.4901, dec: -26.432, magnitude: 0.96, constellation: 'Escorpião', description: 'Supergigante vermelha que marca o coração do Escorpião.' },
  { id: 'spica', name: 'Spica', aliases: ['Alpha Virginis'], kind: 'estrela', ra: 13.4199, dec: -11.1614, magnitude: 0.98, constellation: 'Virgem', description: 'A estrela mais brilhante da constelação de Virgem.' },
  { id: 'pollux', name: 'Pollux', aliases: ['Beta Geminorum'], kind: 'estrela', ra: 7.7553, dec: 28.0262, magnitude: 1.14, constellation: 'Gêmeos', description: 'A mais brilhante das estrelas principais de Gêmeos.' },
  { id: 'fomalhaut', name: 'Fomalhaut', aliases: ['Alpha Piscis Austrini'], kind: 'estrela', ra: 22.9608, dec: -29.6222, magnitude: 1.16, constellation: 'Peixe Austral', description: 'Estrela branca brilhante cercada por um disco de detritos.' },
  { id: 'deneb', name: 'Deneb', aliases: ['Alpha Cygni'], kind: 'estrela', ra: 20.6905, dec: 45.2803, magnitude: 1.25, constellation: 'Cisne', description: 'Supergigante que completa o Triângulo de Verão.' },
  { id: 'regulus', name: 'Regulus', aliases: ['Alpha Leonis'], kind: 'estrela', ra: 10.1395, dec: 11.9672, magnitude: 1.35, constellation: 'Leão', description: 'A estrela mais brilhante de Leão.' },
  { id: 'castor', name: 'Castor', aliases: ['Alpha Geminorum'], kind: 'estrela', ra: 7.5767, dec: 31.8883, magnitude: 1.58, constellation: 'Gêmeos', description: 'Sistema múltiplo que forma uma das cabeças de Gêmeos.' },
  { id: 'bellatrix', name: 'Bellatrix', aliases: ['Gamma Orionis'], kind: 'estrela', ra: 5.4189, dec: 6.3497, magnitude: 1.64, constellation: 'Órion', description: 'Estrela azul no outro ombro de Órion.' },
  { id: 'alnilam', name: 'Alnilam', aliases: ['Epsilon Orionis'], kind: 'estrela', ra: 5.6036, dec: -1.2019, magnitude: 1.69, constellation: 'Órion', description: 'A estrela central das Três Marias.' },
  { id: 'alnitak', name: 'Alnitak', aliases: ['Zeta Orionis'], kind: 'estrela', ra: 5.6793, dec: -1.9426, magnitude: 1.74, constellation: 'Órion', description: 'Uma das Três Marias, no cinturão de Órion.' },
  { id: 'mintaka', name: 'Mintaka', aliases: ['Delta Orionis'], kind: 'estrela', ra: 5.5334, dec: -0.2991, magnitude: 2.23, constellation: 'Órion', description: 'Uma das Três Marias, no cinturão de Órion.' },
  { id: 'hamal', name: 'Hamal', aliases: ['Alpha Arietis'], kind: 'estrela', ra: 2.1196, dec: 23.4624, magnitude: 2.0, constellation: 'Áries', description: 'A estrela mais brilhante de Áries.' },
  { id: 'sheratan', name: 'Sheratan', aliases: ['Beta Arietis'], kind: 'estrela', ra: 1.911, dec: 20.808, magnitude: 2.64, constellation: 'Áries', description: 'Estrela da cabeça do Carneiro.' },
  { id: 'elnath', name: 'Elnath', aliases: ['Beta Tauri'], kind: 'estrela', ra: 5.4382, dec: 28.6074, magnitude: 1.65, constellation: 'Touro', description: 'Marca a ponta de um dos chifres do Touro.' },
  { id: 'alhena', name: 'Alhena', aliases: ['Gamma Geminorum'], kind: 'estrela', ra: 6.6285, dec: 16.3993, magnitude: 1.93, constellation: 'Gêmeos', description: 'Estrela brilhante na constelação de Gêmeos.' },
  { id: 'acubens', name: 'Acubens', aliases: ['Alpha Cancri'], kind: 'estrela', ra: 8.9748, dec: 11.8577, magnitude: 4.25, constellation: 'Câncer', description: 'Estrela tradicional da constelação de Câncer.' },
  { id: 'denebola', name: 'Denebola', aliases: ['Beta Leonis'], kind: 'estrela', ra: 11.8177, dec: 14.5721, magnitude: 2.14, constellation: 'Leão', description: 'Marca a cauda de Leão.' },
  { id: 'zubenelgenubi', name: 'Zubenelgenubi', aliases: ['Alpha Librae'], kind: 'estrela', ra: 14.8479, dec: -16.0418, magnitude: 2.75, constellation: 'Libra', description: 'Sistema estelar na balança de Libra.' },
  { id: 'shaula', name: 'Shaula', aliases: ['Lambda Scorpii'], kind: 'estrela', ra: 17.5601, dec: -37.1038, magnitude: 1.62, constellation: 'Escorpião', description: 'Uma das estrelas que formam o ferrão do Escorpião.' },
  { id: 'kaus-australis', name: 'Kaus Australis', aliases: ['Epsilon Sagittarii'], kind: 'estrela', ra: 18.4029, dec: -34.3846, magnitude: 1.79, constellation: 'Sagitário', description: 'Estrela brilhante do arco de Sagitário.' },
  { id: 'nunki', name: 'Nunki', aliases: ['Sigma Sagittarii'], kind: 'estrela', ra: 18.9211, dec: -26.2967, magnitude: 2.05, constellation: 'Sagitário', description: 'Estrela importante do asterismo do bule em Sagitário.' },
  { id: 'deneb-algedi', name: 'Deneb Algedi', aliases: ['Delta Capricorni'], kind: 'estrela', ra: 21.784, dec: -16.1273, magnitude: 2.85, constellation: 'Capricórnio', description: 'A estrela mais brilhante de Capricórnio.' },
  { id: 'sadalsuud', name: 'Sadalsuud', aliases: ['Beta Aquarii'], kind: 'estrela', ra: 21.5259, dec: -5.5712, magnitude: 2.87, constellation: 'Aquário', description: 'Gigante amarela em Aquário.' },
  { id: 'sadalmelik', name: 'Sadalmelik', aliases: ['Alpha Aquarii'], kind: 'estrela', ra: 22.0964, dec: -0.3198, magnitude: 2.95, constellation: 'Aquário', description: 'Uma das principais estrelas de Aquário.' },
  { id: 'alrescha', name: 'Alrescha', aliases: ['Alpha Piscium'], kind: 'estrela', ra: 2.0341, dec: 2.7638, magnitude: 3.82, constellation: 'Peixes', description: 'Sistema binário que liga as duas figuras de Peixes.' },
  { id: 'mirach', name: 'Mirach', aliases: ['Beta Andromedae'], kind: 'estrela', ra: 1.1622, dec: 35.6206, magnitude: 2.06, constellation: 'Andrômeda', description: 'Gigante vermelha na constelação de Andrômeda.' },
  { id: 'markab', name: 'Markab', aliases: ['Alpha Pegasi'], kind: 'estrela', ra: 23.0794, dec: 15.2053, magnitude: 2.49, constellation: 'Pégaso', description: 'Uma das estrelas do Grande Quadrado de Pégaso.' },
];

export const DEEP_SKY: CatalogObject[] = [
  { id: 'm31', name: 'Galáxia de Andrômeda', aliases: ['M31', 'NGC 224'], kind: 'ceu-profundo', ra: 0.712, dec: 41.269, magnitude: 3.44, constellation: 'Andrômeda', description: 'A grande galáxia espiral vizinha da Via Láctea.' },
  { id: 'm42', name: 'Nebulosa de Órion', aliases: ['M42', 'NGC 1976'], kind: 'ceu-profundo', ra: 5.588, dec: -5.391, magnitude: 4.0, constellation: 'Órion', description: 'Região de formação estelar visível na espada de Órion.' },
  { id: 'm45', name: 'Plêiades', aliases: ['M45', 'Sete Irmãs'], kind: 'ceu-profundo', ra: 3.79, dec: 24.117, magnitude: 1.6, constellation: 'Touro', description: 'Aglomerado aberto muito conhecido em Touro.' },
  { id: 'm13', name: 'Aglomerado de Hércules', aliases: ['M13', 'NGC 6205'], kind: 'ceu-profundo', ra: 16.695, dec: 36.467, magnitude: 5.8, constellation: 'Hércules', description: 'Um dos aglomerados globulares mais famosos.' },
  { id: 'm8', name: 'Nebulosa da Lagoa', aliases: ['M8', 'NGC 6523'], kind: 'ceu-profundo', ra: 18.06, dec: -24.386, magnitude: 6.0, constellation: 'Sagitário', description: 'Grande região de formação estelar em Sagitário.' },
  { id: 'm20', name: 'Nebulosa Trífida', aliases: ['M20', 'NGC 6514'], kind: 'ceu-profundo', ra: 18.034, dec: -23.03, magnitude: 6.3, constellation: 'Sagitário', description: 'Nebulosa de emissão e reflexão próxima da Lagoa.' },
  { id: 'm57', name: 'Nebulosa do Anel', aliases: ['M57', 'NGC 6720'], kind: 'ceu-profundo', ra: 18.893, dec: 33.029, magnitude: 8.8, constellation: 'Lira', description: 'Nebulosa planetária em forma de anel.' },
  { id: 'm104', name: 'Galáxia do Sombrero', aliases: ['M104', 'NGC 4594'], kind: 'ceu-profundo', ra: 12.667, dec: -11.623, magnitude: 8.0, constellation: 'Virgem', description: 'Galáxia famosa pelo bojo luminoso e faixa de poeira.' },
  { id: 'omega-centauri', name: 'Ômega Centauri', aliases: ['NGC 5139'], kind: 'ceu-profundo', ra: 13.447, dec: -47.479, magnitude: 3.9, constellation: 'Centauro', description: 'O maior e mais brilhante aglomerado globular da Via Láctea.' },
  { id: 'crux-coalsack', name: 'Saco de Carvão', aliases: ['Coalsack'], kind: 'ceu-profundo', ra: 12.84, dec: -62.4, magnitude: 6.0, constellation: 'Cruzeiro do Sul', description: 'Nebulosa escura muito evidente ao lado do Cruzeiro do Sul.' },
];

export const CONSTELLATIONS: Constellation[] = [
  { id: 'orion', name: 'Órion', lines: [['betelgeuse', 'bellatrix'], ['bellatrix', 'mintaka'], ['mintaka', 'alnilam'], ['alnilam', 'alnitak'], ['alnitak', 'rigel'], ['rigel', 'alnilam'], ['alnilam', 'betelgeuse']] },
  { id: 'aries', name: 'Áries', lines: [['hamal', 'sheratan']] },
  { id: 'taurus', name: 'Touro', lines: [['aldebaran', 'elnath']] },
  { id: 'gemini', name: 'Gêmeos', lines: [['castor', 'pollux'], ['pollux', 'alhena'], ['castor', 'alhena']] },
  { id: 'leo', name: 'Leão', lines: [['regulus', 'denebola']] },
  { id: 'scorpius', name: 'Escorpião', lines: [['antares', 'shaula']] },
  { id: 'sagittarius', name: 'Sagitário', lines: [['kaus-australis', 'nunki']] },
  { id: 'aquarius', name: 'Aquário', lines: [['sadalmelik', 'sadalsuud']] },
  { id: 'pisces', name: 'Peixes', lines: [['alrescha', 'mirach']] },
];

export const PLANETS: CatalogObject[] = [
  { id: 'sun', name: 'Sol', aliases: ['Sun'], kind: 'planeta', description: 'A estrela central do Sistema Solar.' },
  { id: 'moon', name: 'Lua', aliases: ['Moon'], kind: 'planeta', description: 'O satélite natural da Terra.' },
  { id: 'mercury', name: 'Mercúrio', aliases: ['Mercury'], kind: 'planeta', description: 'O planeta mais próximo do Sol.' },
  { id: 'venus', name: 'Vênus', aliases: ['Venus'], kind: 'planeta', description: 'Planeta rochoso muito brilhante visto da Terra.' },
  { id: 'mars', name: 'Marte', aliases: ['Mars'], kind: 'planeta', description: 'O planeta vermelho.' },
  { id: 'jupiter', name: 'Júpiter', aliases: ['Jupiter'], kind: 'planeta', description: 'O maior planeta do Sistema Solar.' },
  { id: 'saturn', name: 'Saturno', aliases: ['Saturn'], kind: 'planeta', description: 'Gigante gasoso conhecido por seus anéis.' },
  { id: 'uranus', name: 'Urano', aliases: ['Uranus'], kind: 'planeta', description: 'Gigante de gelo do Sistema Solar exterior.' },
  { id: 'neptune', name: 'Netuno', aliases: ['Neptune'], kind: 'planeta', description: 'O planeta principal mais distante do Sol.' },
];

export const ALL_OBJECTS = [...PLANETS, ...NAMED_STARS, ...DEEP_SKY];
