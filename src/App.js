import React, { useState, useEffect } from 'react';

// --- IMPORTAÇÕES DO FIREBASE (ORGANIZADAS) ---
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, query, where, orderBy } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// --- IMPORTAÇÕES DE ÍCONES ---
import { Clock, MapPin, Scissors, User, Phone, CheckCircle, LogIn, LogOut, Calendar } from 'lucide-react';

// --- CONFIGURAÇÃO DO FIREBASE (JÁ PREENCHIDA COM OS SEUS DADOS) ---
const firebaseConfig = {
  apiKey: "AIzaSyBHSMVBz3HdAS7g8LGTRKtFkzG3KORg-4k",
  authDomain: "barbearia-seu-moacir.firebaseapp.com",
  projectId: "barbearia-seu-moacir",
  storageBucket: "barbearia-seu-moacir.appspot.com",
  messagingSenderId: "241468059901",
  appId: "1:241468059901:web:2a0fe8d969a9a820b38e94",
  measurementId: "G-2BS1MEVT2T"
};

// --- INICIALIZAÇÃO SEGURA DO FIREBASE ---
let db, auth;
try {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
} catch (e) {
    console.error("Erro fatal ao inicializar o Firebase:", e);
}


// --- DADOS E CONFIGURAÇÕES GLOBAIS ---

// ATENÇÃO: Substitua pelos e-mails reais do Google dos barbeiros.
const authorizedBarbers = {
    'email.do.pedro@gmail.com': 'pedro',
    'email.do.charles@gmail.com': 'charles'
};

const barbers = [
    {
        id: 'pedro',
        name: 'Pedro',
        imageUrl: 'https://placehold.co/200x200/cccccc/111827?text=Pedro'
    },
    {
        id: 'charles',
        name: 'Charles',
        imageUrl: 'https://placehold.co/200x200/cccccc/111827?text=Charles'
    }
];

// --- COMPONENTES DA APLICAÇÃO ---

const LoadingScreen = () => (
    <div className="bg-black h-screen flex flex-col justify-center items-center text-white">
        <Scissors className="h-16 w-16 text-gray-400 animate-pulse" />
        <p className="mt-4 text-xl">A carregar...</p>
    </div>
);


// =================================================================================
// --- COMPONENTES DO SITE PRINCIPAL ---
// =================================================================================

const Header = () => {
    // Função para lidar com o scroll suave
    const handleSmoothScroll = (e) => {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop,
                behavior: 'smooth'
            });
        }
    };

    return (
        <header className="bg-white text-black shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-6 py-2 flex justify-between items-center">
                <a href="/"><img src="https://i.imgur.com/q2y98tN.png" alt="Logótipo da Seu Moacir Barbearia" className="h-20 w-auto" /></a>
                <nav className="hidden md:flex space-x-6 items-center">
                    <a href="#inicio" onClick={handleSmoothScroll} className="text-lg hover:text-gray-600 transition-colors duration-300">Início</a>
                    <a href="#sobre" onClick={handleSmoothScroll} className="text-lg hover:text-gray-600 transition-colors duration-300">Sobre</a>
                    <a href="#agendamento" onClick={handleSmoothScroll} className="text-lg hover:text-gray-600 transition-colors duration-300">Agendamento</a>
                    <a href="#contato" onClick={handleSmoothScroll} className="text-lg hover:text-gray-600 transition-colors duration-300">Contato</a>
                </nav>
            </div>
        </header>
    );
};

const Hero = () => {
    const [offsetY, setOffsetY] = useState(0);
    const handleScroll = () => setOffsetY(window.pageYOffset);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Função para scroll suave do botão de agendamento
    const handleHeroButtonClick = (e) => {
        e.preventDefault();
        const targetElement = document.getElementById('agendamento');
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section
            id="inicio"
            className="relative h-[85vh] flex items-center justify-center text-white text-center overflow-hidden"
        >
            <div
                className="absolute top-0 left-0 w-full h-full bg-black bg-center bg-cover bg-fixed"
                style={{
                    backgroundImage: "url(https://images.pexels.com/photos/5472251/pexels-photo-5472251.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)",
                    transform: `translateY(${offsetY * 0.4}px)`
                }}
            />
            <div className="absolute top-0 left-0 w-full h-full bg-black opacity-60"></div>
            <div className="relative z-10 p-6">
                <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>Tradição, Estilo e Fé</h2>
                <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.7)'}}>O seu visual em mãos de confiança. Cuidamos do seu estilo com a precisão de um artesão e a dedicação de quem ama o que faz.</p>
                <div className="bg-black/40 backdrop-blur-sm p-6 rounded-lg max-w-2xl mx-auto border border-gray-500">
                    <blockquote className="text-gray-100 italic text-lg">"Seja sobre nós a graça do Senhor, nosso Deus; e confirma sobre nós a obra das nossas mãos; sim, confirma a obra das nossas mãos."</blockquote>
                    <cite className="block text-gray-400 mt-2 not-italic">- Salmo 90:17</cite>
                </div>
                <a href="#agendamento" onClick={handleHeroButtonClick} className="mt-10 inline-block bg-white text-black font-bold py-3 px-8 rounded-lg text-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 shadow-lg">Agende o seu Horário</a>
            </div>
        </section>
    );
};


const About = () => (
  <section id="sobre" className="py-20 bg-white">
    <div className="container mx-auto px-6">
      <h3 className="text-3xl font-bold text-center text-gray-800 mb-2">A Nossa História</h3>
      <p className="text-center text-gray-500 mb-12">Uma tradição de amizade e respeito</p>
      <div className="flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2">
          <img src="https://placehold.co/600x400/111827/ffffff?text=Barbearia+Seu+Moacir" alt="Interior da Barbearia Seu Moacir" className="rounded-lg shadow-xl w-full h-auto object-cover"/>
        </div>
        <div className="md:w-1/2 text-gray-700 space-y-4">
          <p className="text-lg leading-relaxed">A <strong>Seu Moacir Barbearia</strong> carrega mais do que um nome: carrega uma história de amizade. Fundada há décadas pelo Seu Moacir, um ícone na comunidade, o espaço tornou-se um ponto de encontro e confiança.</p>
          <p className="leading-relaxed">Após muitos anos, ele cedeu o seu legado ao grande amigo Pedro, o atual barbeiro, que com respeito e admiração, optou por manter o nome original da barbearia. Hoje, Pedro e Charles continuam a tradição, oferecendo não apenas cortes de cabelo e barba, mas um ambiente de respeito, boa conversa e serviço de excelência.</p>
        </div>
      </div>
    </div>
  </section>
);

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
        if (!db || !selectedDate || !selectedBarber) {
            setAppointments([]);
            return;
        };
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const q = query(collection(db, "agendamentos"), where("data", "==", formattedDate), where("barbeiro", "==", selectedBarber.id));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const bookedTimes = querySnapshot.docs.map(doc => doc.data().hora);
            setAppointments(bookedTimes);
        }, (err) => {
            console.error("Erro ao buscar agendamentos: ", err);
            setError("Não foi possível carregar os horários. Pode ser necessário criar um índice no Firebase. Verifique a consola.");
        });

        return () => unsubscribe();
    }, [selectedDate, selectedBarber]);

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
                nome: nome, telefone: telefone, data: selectedDate.toISOString().split('T')[0], hora: selectedTime, barbeiro: selectedBarber.id, timestamp: new Date()
            });
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false); setNome(''); setTelefone(''); setSelectedTime(null); setSelectedBarber(null);
            }, 5000);
        } catch (err) {
            console.error("Erro ao agendar: ", err);
            setError("Ocorreu um erro ao tentar fazer o agendamento. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) return (
        <div className="text-center p-8 bg-green-50 border border-green-200 rounded-lg max-w-md mx-auto">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h4 className="text-2xl font-bold text-green-800">Agendamento Confirmado!</h4>
            <p className="text-green-700 mt-2">O seu horário com <strong>{selectedBarber.name}</strong> foi reservado com sucesso. Obrigado!</p>
        </div>
    );

    return (
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-2">Faça o seu Agendamento</h3>
            <p className="text-center text-gray-500 mb-8">Rápido, fácil e online.</p>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-8">
                    <p className="block text-lg font-bold text-gray-700 mb-4 text-center">1. Escolha o seu barbeiro:</p>
                    <div className="flex justify-center gap-6">
                        {barbers.map(b => (
                            <div key={b.id} onClick={() => { setSelectedBarber(b); setSelectedTime(null); }} className={`cursor-pointer text-center p-4 border-2 rounded-lg transition-all duration-300 ${selectedBarber?.id === b.id ? 'border-gray-800 bg-gray-50 scale-105' : 'border-gray-200 hover:border-gray-400'}`}>
                                <img src={b.imageUrl} alt={b.name} className="w-24 h-24 rounded-full mx-auto object-cover mb-2" />
                                <span className="font-semibold text-gray-800">{b.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-500 ${!selectedBarber ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                    <div>
                        <div className="mb-6"><label htmlFor="date" className="block text-sm font-bold text-gray-700 mb-2">2. Escolha a data:</label><input type="date" id="date" min={new Date().toISOString().split('T')[0]} value={selectedDate.toISOString().split('T')[0]} onChange={(e) => {setSelectedDate(new Date(e.target.value + 'T00:00:00')); setSelectedTime(null);}} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800"/></div>
                        <div><p className="block text-sm font-bold text-gray-700 mb-2">3. Escolha o horário:</p><div className="grid grid-cols-3 gap-2">{workingHours.map(time => { const isBooked = appointments.includes(time); return (<button type="button" key={time} disabled={isBooked} onClick={() => setSelectedTime(time)} className={`p-3 rounded-lg text-center font-semibold transition-colors duration-200 ${isBooked ? 'bg-gray-200 text-gray-400 cursor-not-allowed line-through' : selectedTime === time ? 'bg-gray-800 text-white ring-2 ring-gray-900' : 'bg-gray-100 text-gray-800 hover:bg-gray-300'}`}>{time}</button>); })}</div></div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg border">
                        <p className="block text-sm font-bold text-gray-700 mb-4">4. Os seus dados:</p>
                        <div className="space-y-4">
                            <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="text" placeholder="O seu nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800"/></div>
                            <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="tel" placeholder="O seu telefone (WhatsApp)" value={telefone} onChange={(e) => setTelefone(e.target.value)} required className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800"/></div>
                            <button type="submit" disabled={isSubmitting || !selectedTime} className="w-full bg-gray-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-black transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">{isSubmitting ? 'A agendar...' : 'Confirmar Agendamento'}</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

const SchedulingSection = () => (<section id="agendamento" className="py-20 bg-gray-100"><div className="container mx-auto px-6"><SchedulingSystem /></div></section>);
const Contact = () => (<section id="contato" className="py-20 bg-gray-800 text-white"><div className="container mx-auto px-6 text-center"><h3 className="text-3xl font-bold mb-8">Venha Visitar-nos</h3><div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16"><div className="flex items-center gap-4"><MapPin className="h-8 w-8 text-white"/><div><h4 className="font-bold">Endereço</h4><p>R. 15 de Novembro, 353 - Jardim Pompeia<br/>Indaiatuba - SP, 13345-070</p></div></div><div className="flex items-center gap-4"><Clock className="h-8 w-8 text-white"/><div><h4 className="font-bold">Horário de Funcionamento</h4><p>Segunda a Sábado<br/>09:00 - 19:00</p></div></div></div></div></section>);
const Footer = () => (<footer className="bg-black py-6"><div className="container mx-auto px-6 text-center text-gray-400"><p>&copy; {new Date().getFullYear()} Seu Moacir Barbearia. Todos os direitos reservados.</p><p className="text-sm mt-2">Desenvolvido com ❤️</p><a href="/admin" className="text-sm mt-2 text-gray-500 hover:text-white transition-colors">Área do Barbeiro</a></div></footer>);

const MainWebsite = () => (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <SchedulingSection />
        <Contact />
      </main>
      <Footer />
    </>
);


// =================================================================================
// --- COMPONENTES DA ÁREA DO BARBEIRO (ADMIN) ---
// =================================================================================

const AdminLogin = ({ onLogin }) => (
    <div className="bg-gray-900 h-screen flex justify-center items-center">
        <div className="text-center p-10 bg-black rounded-xl shadow-2xl border border-gray-700">
            <h2 className="text-3xl font-bold text-white mb-4">Área do Barbeiro</h2>
            <p className="text-gray-400 mb-8">Faça login com a sua conta Google para ver a agenda.</p>
            <button
                onClick={onLogin}
                className="flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105 hover:bg-gray-200"
            >
                <svg className="w-6 h-6" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
                Entrar com Google
            </button>
        </div>
    </div>
);

const AdminDashboard = ({ user, onLogout }) => {
    const [appointments, setAppointments] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);

    const barberId = authorizedBarbers[user.email];

    useEffect(() => {
        if (!db || !barberId) return;

        setIsLoading(true);
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const q = query(
            collection(db, "agendamentos"),
            where("data", "==", formattedDate),
            where("barbeiro", "==", barberId),
            orderBy("hora", "asc")
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedAppointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAppointments(fetchedAppointments);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [selectedDate, barberId]);

    return (
        <div className="bg-gray-100 min-h-screen">
            <header className="bg-black text-white shadow-md">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">Agenda do Barbeiro</h1>
                        <p className="text-sm text-gray-300">Bem-vindo, {user.displayName}!</p>
                    </div>
                    <button onClick={onLogout} className="flex items-center gap-2 bg-white text-black font-bold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                        <LogOut size={18} />
                        Sair
                    </button>
                </div>
            </header>
            <main className="container mx-auto p-6">
                <div className="bg-white p-6 rounded-lg shadow-md mb-6 max-w-sm">
                    <label htmlFor="agenda-date" className="block text-sm font-medium text-gray-700 mb-1">Ver agenda do dia:</label>
                    <input
                        type="date"
                        id="agenda-date"
                        value={selectedDate.toISOString().split('T')[0]}
                        onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black"
                    />
                </div>
                
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 border-b">
                        <h2 className="text-2xl font-bold text-gray-800">Agendamentos para {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</h2>
                    </div>
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">A carregar agendamentos...</div>
                    ) : appointments.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {appointments.map(app => (
                                <li key={app.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-black text-white font-bold p-3 rounded-lg text-center w-20">
                                            <span className="block text-2xl">{app.hora}</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-lg text-gray-800 flex items-center gap-2"><User size={18} /> {app.nome}</p>
                                            <p className="text-gray-600 flex items-center gap-2"><Phone size={16} /> {app.telefone}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-8 text-center">
                            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">Nenhum agendamento para este dia.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};


// =================================================================================
// --- COMPONENTE PRINCIPAL E ROUTER ---
// =================================================================================

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Efeito para injetar o script do Tailwind CDN
  useEffect(() => {
    const scriptId = 'tailwind-cdn-script';
    if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = "https://cdn.tailwindcss.com";
        script.async = true;
        document.head.appendChild(script);
    }
  }, []); 

  // Efeito para lidar com a autenticação
  useEffect(() => {
    if (!auth) {
        setIsAuthenticating(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser); // Pode ser null, um user anónimo, ou um user do Google
        setIsAuthenticating(false);
    });
    return () => unsubscribe();
  }, []);

  // Efeito para lidar com a navegação
  useEffect(() => {
    const onLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', onLocationChange);
    return () => window.removeEventListener('popstate', onLocationChange);
  }, []);

  const handleGoogleLogin = async () => {
      const provider = new GoogleAuthProvider();
      try {
          await signInWithPopup(auth, provider);
      } catch (error) {
          console.error("Erro ao fazer login com Google:", error);
      }
  };

  const handleLogout = async () => {
      await signOut(auth);
      window.location.href = '/'; // Redireciona para a página principal após o logout
  };
  
  // Garante que os clientes anónimos também estejam autenticados para agendar
  useEffect(() => {
    if (!isAuthenticating && !user && currentPath === '/') {
        signInAnonymously(auth).catch(error => {
            console.error("Erro na autenticação anónima automática:", error);
        });
    }
  }, [isAuthenticating, user, currentPath]);

  // Renderização
  
  if (isAuthenticating) {
      return <LoadingScreen />;
  }
  
  if (currentPath === '/admin') {
      const isAuthorized = user && authorizedBarbers[user.email];
      if (isAuthorized) {
          return <AdminDashboard user={user} onLogout={handleLogout} />;
      }
      return <AdminLogin onLogin={handleGoogleLogin} />;
  }

  return <MainWebsite />;
}
