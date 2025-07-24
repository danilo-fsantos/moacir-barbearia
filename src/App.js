import React, { useState, useEffect } from 'react';

// --- IMPORTAÇÕES DO FIREBASE (ORGANIZADAS) ---
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, query, where } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// --- IMPORTAÇÕES DE ÍCONES ---
import { Clock, MapPin, Scissors, User, Phone, CheckCircle, AlertTriangle } from 'lucide-react';

// --- INÍCIO DA CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyBHSMVBz3HdAS7g8LGTRKtFkzG3KORg-4k",
  authDomain: "barbearia-seu-moacir.firebaseapp.com",
  projectId: "barbearia-seu-moacir",
  storageBucket: "barbearia-seu-moacir.firebasestorage.app",
  messagingSenderId: "241468059901",
  appId: "1:241468059901:web:2a0fe8d969a9a820b38e94"
};
// --- FIM DA CONFIGURAÇÃO DO FIREBASE ---

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


// --- COMPONENTES DA INTERFACE ---

const Header = () => (
  <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
    <div className="container mx-auto px-6 py-2 flex justify-between items-center">
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
      <p className="text-center text-amber-600 mb-12">Uma tradição de família desde 1940</p>
      <div className="flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2">
          <img src="https://placehold.co/600x400/1a202c/eab308?text=Foto+da+Barbearia" alt="Interior da Barbearia" className="rounded-lg shadow-xl w-full h-auto object-cover"/>
        </div>
        <div className="md:w-1/2 text-gray-700 space-y-4">
          <p className="text-lg leading-relaxed">
            Bem-vindo à <strong>Seu Moacir Barbearia</strong>! Mais do que um lugar para cortar o cabelo e fazer a barba, somos uma comunidade. Nascemos do sonho de criar um espaço masculino onde a qualidade do serviço, a boa conversa e os valores cristãos andam juntos.
          </p>
          <p className="leading-relaxed">
            Cada cliente é tratado como um amigo. Usamos os melhores produtos e estamos sempre atualizados com as últimas tendências, sem nunca esquecer dos cortes clássicos. A nossa missão é simples: fazer com que saia daqui a sentir-se renovado, confiante e parte da nossa família.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const SchedulingSystem = () => {
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
        if (!db || !selectedDate) return; 
        
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const q = query(collection(db, "agendamentos"), where("data", "==", formattedDate));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const bookedTimes = querySnapshot.docs.map(doc => doc.data().hora);
            setAppointments(bookedTimes);
        }, (err) => {
            console.error("Erro ao buscar agendamentos: ", err);
            setError("Não foi possível carregar os horários. Verifique a sua ligação ou tente mais tarde.");
        });

        return () => unsubscribe();
    }, [selectedDate]);

    const handleDateChange = (event) => {
        const date = new Date(event.target.value + 'T00:00:00');
        setSelectedDate(date);
        setSelectedTime(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!selectedTime || !nome || !telefone) {
            setError("Por favor, preencha todos os campos e selecione um horário.");
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "agendamentos"), {
                nome: nome,
                telefone: telefone,
                data: selectedDate.toISOString().split('T')[0],
                hora: selectedTime,
                timestamp: new Date()
            });
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                setNome('');
                setTelefone('');
                setSelectedTime(null);
            }, 4000);
        } catch (err) {
            console.error("Erro ao agendar: ", err);
            setError("Ocorreu um erro ao tentar fazer o agendamento. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center p-8 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h4 className="text-2xl font-bold text-green-800">Agendamento Confirmado!</h4>
                <p className="text-green-700 mt-2">O seu horário foi reservado com sucesso. Obrigado!</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-2">Faça o seu Agendamento</h3>
            <p className="text-center text-gray-500 mb-8">Rápido, fácil e online.</p>
            
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <div className="mb-6">
                        <label htmlFor="date" className="block text-sm font-bold text-gray-700 mb-2">1. Escolha a data:</label>
                        <input type="date" id="date" min={new Date().toISOString().split('T')[0]} value={selectedDate.toISOString().split('T')[0]} onChange={handleDateChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"/>
                    </div>
                    <div>
                        <p className="block text-sm font-bold text-gray-700 mb-2">2. Escolha o horário:</p>
                        <div className="grid grid-cols-3 gap-2">
                            {workingHours.map(time => {
                                const isBooked = appointments.includes(time);
                                return (
                                    <button key={time} disabled={isBooked} onClick={() => setSelectedTime(time)} className={`p-3 rounded-lg text-center font-semibold transition-colors duration-200 ${ isBooked ? 'bg-gray-200 text-gray-400 cursor-not-allowed line-through' : selectedTime === time ? 'bg-amber-500 text-white ring-2 ring-amber-600' : 'bg-gray-100 text-gray-800 hover:bg-amber-100'}`}>
                                        {time}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg border">
                    <p className="block text-sm font-bold text-gray-700 mb-4">3. Os seus dados:</p>
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
                </form>
            </div>
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
        <div className="flex items-center gap-4"><MapPin className="h-8 w-8 text-amber-400"/><div><h4 className="font-bold">Endereço</h4><p>Rua da Barbearia, 123 - Centro<br/>A sua Cidade, O seu ESTADO</p></div></div>
        <div className="flex items-center gap-4"><Clock className="h-8 w-8 text-amber-400"/><div><h4 className="font-bold">Horário de Funcionamento</h4><p>Segunda a Sábado<br/>09:00 - 19:00</p></div></div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-gray-900 border-t border-gray-800 py-6">
    <div className="container mx-auto px-6 text-center text-gray-400">
      <p>&copy; {new Date().getFullYear()} Seu Moacir Barbearia. Todos os direitos reservados.</p>
      <p className="text-sm mt-2">Desenvolvido com ❤️ por [O seu Nome ou Empresa]</p>
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

    // Função de limpeza para remover o script quando o componente é desmontado
    return () => {
      document.head.removeChild(script);
    };
  }, []); // O array vazio assegura que este efeito corre apenas uma vez

  // Efeito para autenticação com o Firebase
  useEffect(() => {
    if (!auth) {
        setIsAuthenticating(false);
        return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticating(false);
      } else {
        signInAnonymously(auth).catch(error => {
          console.error("Erro na autenticação anónima:", error);
          setIsAuthenticating(false); 
        });
      }
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
