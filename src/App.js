import React, { useState, useEffect } from 'react';

// --- IMPORTAÇÕES DO FIREBASE (ORGANIZADAS) ---
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, query, where } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// --- IMPORTAÇÕES DE ÍCONES ---
import { Clock, MapPin, Scissors, User, Phone, CheckCircle, AlertTriangle } from 'lucide-react';

// --- CONFIGURAÇÃO DO FIREBASE (USANDO VARIÁVEIS DE AMBIENTE) ---
// Estas chaves são carregadas a partir da configuração da Vercel.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// --- COMPONENTES DE ESTADO DA APLICAÇÃO ---
const LoadingScreen = () => (
    <div className="bg-gray-900 h-screen flex flex-col justify-center items-center text-white">
        <Scissors className="h-16 w-16 text-amber-500 animate-pulse" />
        <p className="mt-4 text-xl">A carregar a barbearia...</p>
    </div>
);

// --- INICIALIZAÇÃO SEGURA DO FIREBASE ---
let db, auth;
try {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
} catch (e) {
    console.error("Erro fatal ao inicializar o Firebase:", e);
}

// --- DADOS DOS BARBEIROS ---
const barbers = [
    {
        id: 'pedro',
        name: 'Pedro',
        // ATENÇÃO: Substitua este link por uma foto real do Pedro.
        imageUrl: 'https://placehold.co/200x200/eab308/1a202c?text=Pedro'
    },
    {
        id: 'charles',
        name: 'Charles',
        // ATENÇÃO: Substitua este link por uma foto real do Charles.
        imageUrl: 'https://placehold.co/200x200/eab308/1a202c?text=Charles'
    }
];

// --- COMPONENTES DA INTERFACE ---

const Header = () => (
  <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
    <div className="container mx-auto px-6 py-2 flex justify-between items-center">
      {/* ATENÇÃO: Este é um link para o seu logo. Se quiser alterar, suba a imagem para o imgur.com e cole o novo link aqui. */}
      <img src="https://i.imgur.com/q2y98tN.png" alt="Logótipo da Seu Moacir Barbearia" className="h-20 w-auto" />
      <nav className="hidden md:flex space-x-6 items-center">
        <a href="#inicio" className="text-lg hover:text-amber-400 transition-colors duration-300">Início</a>
        <a href="#sobre" className="text-lg hover:text-amber-400 transition-colors duration-300">Sobre</a>
        <a href="#agendamento" className="text-lg hover:text-amber-400 transition-colors duration-300">Agendamento</a>
        <a href="#contato" className="text-lg hover:text-amber-400 transition-colors duration-300">Contato</a>
      </nav>
    </div>
  </header>
);

const Hero = () => (
  <section id="inicio" className="bg-gray-800 text-white py-20 md:py-32">
    <div className="container mx-auto px-6 text-center">
      <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">Tradição, Estilo e Fé</h2>
      <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">O seu visual em mãos de confiança. Cuidamos do seu estilo com a precisão de um artesão e a dedicação de quem ama o que faz.</p>
      <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-lg max-w-2xl mx-auto border border-gray-700">
        <blockquote className="text-amber-400 italic text-lg">
          "Seja sobre nós a graça do Senhor, nosso Deus; e confirma sobre nós a obra das nossas mãos; sim, confirma a obra das nossas mãos."
        </blockquote>
        <cite className="block text-gray-400 mt-2 not-italic">- Salmo 90:17</cite>
      </div>
      <a href="#agendamento" className="mt-10 inline-block bg-amber-500 text-gray-900 font-bold py-3 px-8 rounded-lg text-lg hover:bg-amber-400 transition-transform duration-300 transform hover:scale-105">
        Agende o seu Horário
      </a>
    </div>
  </section>
);

const About = () => (
  <section id="sobre" className="py-20 bg-gray-100">
    <div className="container mx-auto px-6">
      <h3 className="text-3xl font-bold text-center text-gray-800 mb-2">A Nossa História</h3>
      <p className="text-center text-amber-600 mb-12">Uma tradição de amizade e respeito</p>
      <div className="flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2">
           {/* ATENÇÃO: Substitua este link pela foto real da barbearia. Suba a imagem para o imgur.com e cole o novo link aqui. */}
          <img src="https://placehold.co/600x400/1a202c/eab308?text=Barbearia+Seu+Moacir" alt="Interior da Barbearia Seu Moacir" className="rounded-lg shadow-xl w-full h-auto object-cover"/>
        </div>
        <div className="md:w-1/2 text-gray-700 space-y-4">
          <p className="text-lg leading-relaxed">
            A <strong>Seu Moacir Barbearia</strong> carrega mais do que um nome: carrega uma história de amizade. Fundada há décadas pelo Seu Moacir, um ícone na comunidade, o espaço tornou-se um ponto de encontro e confiança.
          </p>
          <p className="leading-relaxed">
            Após muitos anos, ele cedeu o seu legado ao grande amigo Pedro, o atual barbeiro, que com respeito e admiração, optou por manter o nome original da barbearia. Hoje, Pedro e Charles continuam a tradição, oferecendo não apenas cortes de cabelo e barba, mas um ambiente de respeito, boa conversa e serviço de excelência.
          </p>
        </div>
      </div>
    </div>
  </section>
);

// NOVO SISTEMA DE AGENDAMENTO
const SchedulingSystem = () => {
    const [selectedBarber, setSelectedBarber] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(null);
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const workingHours = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

    useEffect(() => {
        // Só busca horários se um barbeiro e uma data estiverem selecionados.
        if (!db || !selectedDate || !selectedBarber) {
            setAppointments([]);
            return;
        };
        
        const formattedDate = selectedDate.toISOString().split('T')[0];
        // Nova query que filtra por data E por barbeiro.
        const q = query(
            collection(db, "agendamentos"), 
            where("data", "==", formattedDate),
            where("barbeiro", "==", selectedBarber.id)
        );
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const bookedTimes = querySnapshot.docs.map(doc => doc.data().hora);
            setAppointments(bookedTimes);
        }, (err) => {
            console.error("Erro ao buscar agendamentos: ", err);
            setError("Não foi possível carregar os horários. Pode ser necessário criar um índice no Firebase. Verifique a consola para mais detalhes.");
        });

        return () => unsubscribe();
    }, [selectedDate, selectedBarber]); // Depende do barbeiro selecionado agora

    const handleSelectBarber = (barber) => {
        setSelectedBarber(barber);
        setSelectedTime(null); // Reseta a hora selecionada ao trocar de barbeiro
    }

    const handleDateChange = (event) => {
        const date = new Date(event.target.value + 'T00:00:00');
        setSelectedDate(date);
        setSelectedTime(null); // Reseta a hora selecionada ao trocar de data
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!selectedBarber || !selectedTime || !nome || !telefone) {
            setError("Por favor, selecione um barbeiro, uma data, um horário e preencha os seus dados.");
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "agendamentos"), {
                nome: nome,
                telefone: telefone,
                data: selectedDate.toISOString().split('T')[0],
                hora: selectedTime,
                barbeiro: selectedBarber.id, // Salva o ID do barbeiro
                timestamp: new Date()
            });
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                setNome('');
                setTelefone('');
                setSelectedTime(null);
                setSelectedBarber(null); // Reseta o barbeiro selecionado
            }, 5000);
        } catch (err) {
            console.error("Erro ao agendar: ", err);
            setError("Ocorreu um erro ao tentar fazer o agendamento. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center p-8 bg-green-50 border border-green-200 rounded-lg max-w-md mx-auto">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h4 className="text-2xl font-bold text-green-800">Agendamento Confirmado!</h4>
                <p className="text-green-700 mt-2">O seu horário com <strong>{selectedBarber.name}</strong> foi reservado com sucesso. Obrigado!</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-2">Faça o seu Agendamento</h3>
            <p className="text-center text-gray-500 mb-8">Rápido, fácil e online.</p>
            
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="mb-8">
                    <p className="block text-lg font-bold text-gray-700 mb-4 text-center">1. Escolha o seu barbeiro:</p>
                    <div className="flex justify-center gap-6">
                        {barbers.map(barber => (
                            <div key={barber.id} onClick={() => handleSelectBarber(barber)} className={`cursor-pointer text-center p-4 border-2 rounded-lg transition-all duration-300 ${selectedBarber?.id === barber.id ? 'border-amber-500 bg-amber-50 scale-105' : 'border-gray-200 hover:border-amber-400'}`}>
                                <img src={barber.imageUrl} alt={barber.name} className="w-24 h-24 rounded-full mx-auto object-cover mb-2" />
                                <span className="font-semibold text-gray-800">{barber.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-500 ${!selectedBarber ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                    <div>
                        <div className="mb-6">
                            <label htmlFor="date" className="block text-sm font-bold text-gray-700 mb-2">2. Escolha a data:</label>
                            <input type="date" id="date" min={new Date().toISOString().split('T')[0]} value={selectedDate.toISOString().split('T')[0]} onChange={handleDateChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"/>
                        </div>
                        <div>
                            <p className="block text-sm font-bold text-gray-700 mb-2">3. Escolha o horário:</p>
                            <div className="grid grid-cols-3 gap-2">
                                {workingHours.map(time => {
                                    const isBooked = appointments.includes(time);
                                    return (
                                        <button type="button" key={time} disabled={isBooked} onClick={() => setSelectedTime(time)} className={`p-3 rounded-lg text-center font-semibold transition-colors duration-200 ${ isBooked ? 'bg-gray-200 text-gray-400 cursor-not-allowed line-through' : selectedTime === time ? 'bg-amber-500 text-white ring-2 ring-amber-600' : 'bg-gray-100 text-gray-800 hover:bg-amber-100'}`}>
                                            {time}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg border">
                        <p className="block text-sm font-bold text-gray-700 mb-4">4. Os seus dados:</p>
                        <div className="space-y-4">
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input type="text" placeholder="O seu nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"/>
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input type="tel" placeholder="O seu telefone (WhatsApp)" value={telefone} onChange={(e) => setTelefone(e.target.value)} required className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"/>
                            </div>
                            <button type="submit" disabled={isSubmitting || !selectedTime} className="w-full bg-gray-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                {isSubmitting ? 'A agendar...' : 'Confirmar Agendamento'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};


const SchedulingSection = () => (
    <section id="agendamento" className="py-20 bg-gray-800" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')"}}>
        <div className="container mx-auto px-6">
            <SchedulingSystem />
        </div>
    </section>
);

const Contact = () => (
  <section id="contato" className="py-20 bg-gray-900 text-white">
    <div className="container mx-auto px-6 text-center">
      <h3 className="text-3xl font-bold mb-8">Venha Visitar-nos</h3>
      <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
        <div className="flex items-center gap-4">
            <MapPin className="h-8 w-8 text-amber-400"/>
            <div>
                <h4 className="font-bold">Endereço</h4>
                <p>R. 15 de Novembro, 353 - Jardim Pompeia<br/>Indaiatuba - SP, 13345-070</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <Clock className="h-8 w-8 text-amber-400"/>
            <div>
                <h4 className="font-bold">Horário de Funcionamento</h4>
                <p>Segunda a Sábado<br/>09:00 - 19:00</p>
            </div>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-gray-900 border-t border-gray-800 py-6">
    <div className="container mx-auto px-6 text-center text-gray-400">
      <p>&copy; {new Date().getFullYear()} Seu Moacir Barbearia. Todos os direitos reservados.</p>
      <p className="text-sm mt-2">Desenvolvido com ❤️</p>
    </div>
  </footer>
);

// Componente Principal da Aplicação
export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  // Efeito para injetar o script do Tailwind CDN
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.tailwindcss.com";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Previne que múltiplos scripts sejam adicionados em re-renderizações rápidas.
      const existingScript = document.querySelector('script[src="https://cdn.tailwindcss.com"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []); 

  // Efeito para autenticação com o Firebase
  useEffect(() => {
    if (!auth) {
        setIsAuthenticating(false);
        return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        signInAnonymously(auth).catch(error => {
          console.error("Erro na autenticação anónima:", error);
        });
      }
      setIsAuthenticating(false); 
    });
    return () => unsubscribe();
  }, []);
  
  if (isAuthenticating) {
      return <LoadingScreen />;
  }

  return (
    <div className="bg-gray-800">
      <Header />
      <main>
        <Hero />
        <About />
        <SchedulingSection />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

