
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LiveSetup from './components/LiveSetup';
import LiveDashboard from './components/LiveDashboard';
import { type LiveSession, type Product } from './types';
import ErrorToast from './components/ui/ErrorToast';

const thermalCupProduct: Product = {
  id: 'prod_copo_termico_romantic_crown',
  name: 'Romantic Crown Copo Térmico com Canudo Tampa e Alça 1,18L',
  regularPrice: 99.00,
  salePrice: 49.00,
  description: `Romantic Crown Copo Térmico com Canudo Tampa e Alça 1,18L, Copos Garrafas Termico para viagem vácuo dupla camada aço inoxidável, Caneca Termica Cafe Água Chá,Presente, Fitness (Creme)
【Tampa 100% à prova de vazamentos】Romantic Crown Copo Térmico 1,18l apresenta uma tampa à prova de vazamentos recém-atualizada e um design de torção de rosca dupla, tornando o copo totalmente hermético e à prova de suor. Ele pode suportar facilmente a vibração e os solavancos durante esportes ou viagens de carro e aproveitar a diversão de beber água!
【Aço inoxidável a vácuo duplo】Romantic Crown Copo Termico produzido em 304 aço inoxidável com uma técnica de parede dupla e vácuo entre as paredes, conserva sua bebida por mais tempo. manter as bebidas frias por até 30 horas e quentes por até 8 horas,O aço 18/8 evita que os copos ou canecas fiquem com cheiro e gosto de bebidas e alimentos. Produto livre de BPA.
【Caneca de viagem com Canudo e Tampa】Romantic Crown Copo Termico com Canudo e Alça,Essa caneca de vidro grande pode ser colocada com segurança na maioria dos porta-copos de carro, não é preciso se preocupar com ela quando estiver em uma viagem longa. A alça dessa caneca é muito confortável, você pode carregá-la facilmente em qualquer ocasião, como em casa, no escritório, na academia, no acampamento, nas férias, nos esportes, em viagens e assim por diante. Essa é sua melhor escolha.
【Pode ser lavada na máquina de lavar louça e não contém BPA】 O interior eletropolido garante que a garrafa permaneça intacta, e o material resistente de alta qualidade faz com que a garrafa possa ser lavada na máquina de lavar louça, liberando suas mãos! A garrafa é livre de BPA e inodora, perfeita para qualquer cerveja, água, refrigerante, leite, café gelado, chá, bebidas mistas, até mesmo smoothies, qualquer bebida que você quiser.
【Adequada para presentear】 Esta caneca de café é o presente perfeito para professores, médicos e motoristas que precisam beber muita água ou que não conseguem repor água facilmente. Também é ótima para o Dia dos Pais, Natal, Ação de Graças, Páscoa e outros feriados.`,
  imageUrl: 'https://m.media-amazon.com/images/I/61JBhlv90eL._AC_SX679_.jpg',
  sellerName: 'Utilidades Premium',
  sellingPoints: [
    '🔥 Promoção Imperdível! De R$99 por apenas R$49, só hoje!',
    '💧 Tampa 100% à prova de vazamentos! Leve na bolsa ou no carro sem preocupação.',
    '🧊 Mantém sua bebida gelada por até 30 horas e quente por até 8 horas!',
    '✨ Feito de aço inoxidável 304, não pega cheiro e nem gosto!',
    '🚗 Encaixe perfeito na maioria dos porta-copos de carro, ideal para viagens.',
    '🧼 Fácil de limpar, pode ir na lava-louças e é livre de BPA, sua saúde em primeiro lugar!',
    '🤚 Alça super confortável para levar para qualquer lugar: academia, trabalho, acampamento.',
    '🎁 O presente perfeito para qualquer ocasião: Dia dos Pais, Natal, Aniversário!'
  ],
  reviews: [
    'Copo maravilhoso! Realmente não vaza nada e conserva a água geladinha o dia todo. A cor é linda!',
    'Melhor compra do ano. Levo para o trabalho todos os dias. A alça faz toda a diferença.',
    'A qualidade é surpreendente pelo preço. Recomendo muito! Chegou antes do prazo.'
  ],
  variations: [
    'Disponível em várias cores, clique na sacolinha para conferir!',
    'Compre 2 e ganhe frete grátis para todo o Brasil!'
  ]
};

const cushionCoverProduct: Product = {
  id: 'prod_natal_2024',
  name: 'Kit 4 Capas de Almofada Decorativas de Natal – Noite Feliz',
  regularPrice: 39.90,
  salePrice: 29.70,
  description: `Transforme o clima da sua casa neste Natal com charme, aconchego e alegria!
Este lindo kit com 4 capas de almofada temáticas natalinas traz estampas exclusivas com árvores de Natal, rena, boneco de neve e elementos festivos que iluminam qualquer ambiente com o verdadeiro espírito natalino.

🛋️ Perfeito para decorar:
Sala de estar
Quartos
Varanda
Escritórios e lojas temáticas

As capas são confeccionadas com tecido macio, resistente e de toque agradável, proporcionando conforto e beleza. Seu fechamento em zíper invisível garante um acabamento elegante e facilita a remoção para lavagem.

🎅 Benefícios:
✅ Renova o ambiente instantaneamente com o clima natalino
✅ Ideal para presentear amigos e familiares
✅ Design moderno e delicado, combina com qualquer estilo de decoração
✅ Fácil de limpar e guardar para usar em todos os Natais
✅ Alta durabilidade e cores vibrantes

📏 Tamanho aproximado: 45 cm x 45 cm (compatível com enchimentos padrão)
📦 Conteúdo do kit: 4 capas de almofada (não inclui enchimento)
🧵 Material: Poliéster premium de alta qualidade

💡 Dica: Combine com luzes pisca-pisca, pinheiros e enfeites natalinos para criar uma decoração inesquecível e acolhedora.

✨ Deixe sua casa pronta para receber o Natal com estilo e alegria — e encante todos os seus convidados!`,
  imageUrl: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTraS7ZSLMfUUA5b2YivE0TQH-Q8kxzNnLyj15t31XApDDl9t3_s51Y7CeoFo4ZPYy-OxCy5cGTbYwV6GHKG5_LtLLDwTpUKPEIC1Z0LGMc4UanoHWYZglq',
  sellerName: 'Casa & Conforto',
  sellingPoints: [
    '🎄 Kit com 4 capas de almofada natalinas exclusivas',
    '🧵 Tecido macio, resistente e toque suave, ideal para o conforto do lar',
    '🌟 Estampas com árvores de Natal, rena e boneco de neve — cores vivas e alegres',
    '🏠 Decore sala, quarto, varanda ou loja com o clima mágico do Natal',
    '💚 Fechamento em zíper invisível – acabamento elegante e fácil de lavar',
    '📏 Tamanho padrão 45x45cm, compatível com enchimentos comuns',
    '🎁 Presente perfeito para amigos e familiares',
    '🔥 Desconto de 26% + promoção relâmpago por tempo limitado',
    '⭐ Avaliação 4.6 estrelas com mais de 1.200 vendas confirmadas'
  ],
  reviews: [
    'Chegou super rápido e a qualidade é ótima! Minha sala ficou linda pro Natal!',
    'Amei as estampas, são exatamente como na foto. Tecido bom e o zíper é bem discreto.'
  ],
  variations: [
    'Leve 2 kits e ganhe 10% de desconto extra!',
    'Temos também a opção com enchimento incluso.'
  ]
};

const wheyProduct: Product = {
  id: 'prod_whey_protein_900g',
  name: 'WHEY PROTEIN CONCENTRADO - POTE 900G',
  regularPrice: 250.00,
  salePrice: 169.90,
  description: `O que é:
Nosso Whey Protein Concentrado é uma proteína 100% pura, cuidadosamente extraída do soro do leite, sem blends ou adição de outras proteínas. Oferece 20g de proteína por porção e um perfil de aminoácidos completo para construção ou manutenção da massa muscular, com 12 sabores surpreendentes.

Ideal Para:
Indicado para quem deseja aumentar a ingestão diária de proteínas de forma saborosa e nutritiva, além de atender às necessidades de praticantes de atividades físicas que buscam melhorar a performance.

Por trás do rótulo:
A proteína é um macronutriente essencial porque fornece aminoácidos fundamentais para a construção e reparação do tecido muscular. O Whey Protein Concentrado passa por rigoroso processo de filtragem, tornando-se uma fonte altamente absorvível de aminoácidos essenciais, oferecendo suporte significativo para o ganho de massa muscular, recuperação e desempenho durante os treinos.

Sugestões de Uso:
O Whey Protein Concentrado pode ser consumido diariamente, seja no café da manhã, antes ou depois dos treinos, ou em qualquer momento do dia como um lanche saudável e delicioso. Mesmo nos dias de descanso, ele é uma excelente opção para aumentar a ingestão diária de proteínas. Prepare com água, leite, frutas ou adicione em suas receitas favoritas.`,
  imageUrl: 'https://duxnutrition.vtexassets.com/arquivos/ids/168692/DUX-REBRANDING-WPC-900-G-BANNER-01-R01.png?v=638853441152400000',
  sellerName: 'Growth Supplements',
  sellingPoints: [
    '🔥 Promoção Relâmpago! Desconto válido por tempo limitado!',
    '💪 20g de proteína de alta qualidade por porção para seus músculos',
    '🥛 100% puro, extraído do soro do leite para máxima absorção e resultados',
    '🏋️‍♂️ Perfil completo de aminoácidos que acelera a construção e recuperação muscular',
    '🏃‍♀️ Ideal para melhorar sua performance e atingir seus objetivos de forma mais rápida',
    '🍓 Disponível em 12 sabores incríveis para todos os gostos!',
    '✅ Aumenta a ingestão diária de proteínas de forma prática, saudável e deliciosa'
  ],
  reviews: [
    'Tem um sabor agradável, suave que não interfere na sua bebida, sem contar as bolinhas crocantes que vem dentro.',
    'Maravilhoso... com café é perfeito!',
    'MINHA ESCOLHA FOI DE CHOCOLATE BRANCO, ADOREI POIS ELE TEM O SABOR DO CHOCOLATE MESMO, UMA DELÍCIA! ANSIOSA PRA CONHECER OUTROS SABORES',
    'Esse cappuccino é delicioso! Melhor maneira de tomar whey quente. Vai bem tanto batido com leite, quanto misturado com café.'
  ],
  variations: [
    'Disponível em 12 sabores surpreendentes!',
    'Pode ser consumido com água, leite ou adicionado em suas receitas favoritas.',
    'Opções de 900g e refil.'
  ]
};

const drillProduct: Product = {
  id: 'prod_parafusadeira_48v',
  name: 'Parafusadeira e Furadeira 48 Volts 2 Baterias Com Maleta e Acessórios Completo',
  regularPrice: 360.00,
  salePrice: 145.00,
  description: `A Parafusadeira Furadeira 48V com 2 Baterias, Maleta e Acessórios é a ferramenta perfeita para quem busca potência, praticidade e versatilidade no dia a dia. Ideal tanto para uso doméstico quanto profissional, ela combina alto desempenho com um design ergonômico e moderno.

Equipada com duas baterias recarregáveis de longa duração, oferece autonomia para realizar diversos trabalhos sem interrupções. Seu motor de torque ajustável garante força suficiente para furar madeira, metal, plástico e até pequenas alvenarias, além de apertar e soltar parafusos com rapidez e precisão.

A maleta resistente permite organizar e transportar facilmente a furadeira e todos os acessórios, incluindo brocas, bits e adaptadores. Além disso, conta com iluminação LED integrada, que facilita o uso em locais com pouca luz, e sistema de carregamento rápido com proteção contra sobrecarga, garantindo segurança e durabilidade.

Compacta, leve e completa, essa parafusadeira é uma excelente escolha para quem quer desempenho profissional com ótimo custo-benefício. Ideal para montar móveis, instalar prateleiras, fixar quadros e realizar reparos rápidos em casa ou no trabalho.`,
  imageUrl: 'https://ae01.alicdn.com/kf/Sc6daaa399f9e47aab1d5a2cfe791591cX.jpg?width=994&height=993&hash=1987',
  sellerName: 'PowerTools',
  sellingPoints: [
    'Potente motor de alto desempenho com torque ajustável para diferentes tipos de trabalho',
    'Duas baterias recarregáveis de longa duração que garantem autonomia e praticidade',
    'Função 2 em 1: furadeira e parafusadeira, ideal para uso doméstico ou profissional',
    'Design ergonômico e leve, proporcionando conforto durante o uso prolongado',
    'Maleta resistente para transporte e armazenamento seguro de todas as peças',
    'Kit completo com brocas, bits e acessórios para diferentes tipos de superfícies',
    'Iluminação LED integrada para facilitar o trabalho em locais com pouca luz',
    'Carregamento rápido e sistema de proteção contra sobrecarga da bateria',
    'Perfeita para montar móveis, fixar prateleiras, instalar quadros e pequenos reparos em casa',
    'Excelente custo-benefício com desempenho semelhante a modelos profissionais',
    '🛍️ Clica na sacolinha aqui do lado e confere outros produtos com desconto!'
  ],
  reviews: [
    "Produto chegou dentro do prazo e bem embalado. Já testei e tem bastante força, fura madeira e parede sem dificuldade.",
    "As duas baterias são ótimas, dá pra usar uma enquanto a outra carrega. A maleta é bem prática e organizada.",
    "Excelente custo-benefício! Cumpre o que promete, uso para pequenos serviços em casa e me surpreendeu pela potência.",
    "Funciona perfeitamente. A luz LED ajuda bastante e o acabamento é muito bom. Recomendo!",
    "Achei que seria mais fraca pelo preço, mas é muito eficiente. Ideal para uso doméstico."
  ],
  variations: [
    'Promoção relâmpago por tempo limitado, acaba hoje',
    'Garantia de 3 meses contra defeitos de fabricação'
  ]
};

const laserLevelProduct: Product = {
  id: 'prod_nivel_laser_4d_16',
  name: 'Nível Laser 4d Profissional 16 Linhas Autonivelante Com Controle Remoto',
  regularPrice: 699.00,
  salePrice: 319.00,
  description: `O Nível Laser 4D de 16 Linhas é a solução definitiva para medições precisas e trabalhos profissionais. Com um laser verde de alta visibilidade (comprimento de onda de 515 nm) e alcance de até 30 metros, garante resultados excepcionais mesmo em ambientes com alta luminosidade. Seu design robusto, com classificação IP54, proporciona resistência à água e durabilidade em condições desafiadoras. Equipado com duas baterias recarregáveis de 2400mAh, oferece autonomia prolongada para uso contínuo. O controle remoto infravermelho facilita ajustes precisos à distância, enquanto os suportes versáteis e a maleta de transporte tornam este dispositivo ideal para diferentes locais de trabalho. Seja para nivelamento, instalação ou construção, o Nível Laser 4D de 16 Linhas combina precisão, praticidade e inovação para transformar seus desafios de medição em soluções eficientes.`,
  imageUrl: 'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/b9c1922fa2fe488fb12bd6f6c1c85e6~tplv-aphluv4xwc-resize-webp:800:800.webp?dr=15584&t=555f072d&ps=933b5bde&shp=6ce186a1&shcp=e1be8f53&idc=my2&from=1826719393',
  sellerName: 'Ferramentas PRO',
  sellingPoints: [
    '🔥 Mais de 50% OFF! De R$699 por apenas R$319, só enquanto durar o estoque!',
    '🎯 Laser verde 16 linhas de alta visibilidade, perfeito para ambientes claros e longas distâncias (até 30m).',
    '💧 À prova d\'água e poeira (IP54). Construído para aguentar o tranco do dia a dia na obra.',
    '🔋 Duas baterias de longa duração! Trabalhe o dia inteiro sem se preocupar em recarregar.',
    '🕹️ Controle remoto incluso para ajustes fáceis e rápidos à distância. Mais agilidade no seu trabalho!',
    '✅ Autonivelante com precisão milimétrica (±1mm/7m). Acabamento profissional garantido!',
    '🧰 Maleta completa com tripé, suporte magnético e plataforma elevatória. Tudo que você precisa em um só kit!',
    '🛠️ Ideal para instalação de pisos, azulejos, forros, drywall, armários e muito mais!'
  ],
  reviews: [
    'Ferramenta fantástica! O laser verde é muito forte, consigo ver até de dia. As baterias duram bastante e a maleta ajuda a manter tudo organizado.',
    'Melhorou muito a qualidade e a velocidade do meu trabalho. O autonivelamento é rápido e preciso. Recomendo demais, vale cada centavo.',
    'Chegou rápido e o kit é bem completo. O controle remoto é uma mão na roda, não preciso ficar subindo e descendo da escada pra ajustar.',
    'Impressionado com a qualidade. Já usei na chuva e ele aguentou firme. Precisão nota 10.'
  ],
  variations: [
    'Compre agora e ganhe um par de óculos de proteção verde!',
    'Garantia estendida de 1 ano disponível, confira na sacolinha!',
    'Frete grátis para todo o Brasil por tempo limitado!'
  ]
};


const App = () => {
  const [liveSession, setLiveSession] = useState<LiveSession | null>(null);
  const [liveStartTime, setLiveStartTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const savedProducts = localStorage.getItem('ai-live-seller-products');
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validProducts = parsed.filter(p => p && typeof p === 'object' && p.id);
          
          return validProducts.map((p: any) => ({
            id: p.id,
            name: p.name || 'Produto Inválido',
            regularPrice: typeof p.regularPrice === 'number' ? p.regularPrice : (typeof p.price === 'number' ? p.price : 0),
            salePrice: typeof p.salePrice === 'number' ? p.salePrice : undefined,
            description: p.description || 'Este produto não tem uma descrição.',
            imageUrl: p.imageUrl || `https://picsum.photos/seed/${p.id || 'default'}/400/300`,
            sellerName: p.sellerName || 'Loja Parceira',
            sellingPoints: Array.isArray(p.sellingPoints) ? p.sellingPoints : ['Produto de alta qualidade!'],
            reviews: Array.isArray(p.reviews) ? p.reviews : undefined,
            variations: Array.isArray(p.variations) ? p.variations : undefined,
          }));
        }
      }
    } catch (error) {
      console.error('Error reading products from localStorage', error);
    }
    return [laserLevelProduct, thermalCupProduct, cushionCoverProduct, wheyProduct, drillProduct];
  });

  useEffect(() => {
    try {
      localStorage.setItem('ai-live-seller-products', JSON.stringify(products));
    } catch (error) {
      console.error('Error saving products to localStorage', error);
    }
  }, [products]);

  const handleStartLive = (session: LiveSession) => {
    setError(null);
    setLiveSession(session);
    setLiveStartTime(new Date());
  };

  const handleEndLive = () => {
    setLiveSession(null);
    setLiveStartTime(null);
  };

  const handleAddNewProduct = (newProduct: Product) => {
    setProducts(prevProducts => [...prevProducts, newProduct]);
  };
  
  const handleError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 10000);
  };

  return (
    <div className="h-screen bg-primary font-sans flex items-center justify-center p-4">
      <div className="w-full h-full bg-primary flex flex-col border border-border-color rounded-xl overflow-hidden shadow-2xl max-w-screen-2xl">
        <Header isLive={!!liveSession} startTime={liveStartTime} />
        {error && <ErrorToast message={error} onClose={() => setError(null)} />}
        <main className="flex-grow relative overflow-hidden p-4 md:p-8">
          <div className="h-full overflow-y-auto">
              {liveSession ? (
              <LiveDashboard 
                  session={liveSession} 
                  onEndLive={handleEndLive}
                  onError={handleError}
              />
              ) : (
              <LiveSetup 
                  products={products}
                  onStartLive={handleStartLive} 
                  onAddProduct={handleAddNewProduct}
              />
              )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;