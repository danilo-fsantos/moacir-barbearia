import React, { useState, useEffect, useRef } from 'react';

// --- IMPORTAÇÕES DO FIREBASE (ORGANIZADAS E EXPANDIDAS) ---
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, query, where, orderBy, doc, deleteDoc, getDocs, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

// --- IMPORTAÇÕES DE ÍCONES ---
import { Clock, MapPin, Scissors, User, Phone, CheckCircle, LogOut, Calendar, Menu, X, Tag, Mail, Lock, Bell, Edit, Trash2, Home, UserCheck, BookOpen } from 'lucide-react';

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

const authorizedBarbers = {
    // IMPORTANTE: E-mails dos barbeiros autorizados a ver o painel
    'danilof974@gmail.com': 'pedro', // Acesso à agenda do Pedro
    // 'email.do.charles@gmail.com': 'charles' // Exemplo para o Charles
};

const barbers = [
    { id: 'pedro', name: 'Pedro', imageUrl: 'https://placehold.co/200x200/cccccc/111827?text=Pedro' },
    { id: 'charles', name: 'Charles', imageUrl: 'https://placehold.co/200x200/cccccc/111827?text=Charles' }
];

const services = [
    { id: 'corte', name: 'Corte de Cabelo', price: '40,00', duration: 60 },
    { id: 'barba', name: 'Barba', price: '40,00', duration: 60 },
    { id: 'corte_barba', name: 'Corte e Barba', price: '75,00', duration: 60 },
    { id: 'corte_sobrancelha', name: 'Corte + Sobrancelha', price: '50,00', duration: 60 },
    { id: 'corte_simples', name: 'Corte Simples (máquina)', price: '25,00', duration: 30 },
    { id: 'pezinho', name: 'Pezinho', price: '15,00', duration: 30 },
    { id: 'depilacao', name: 'Depilação (nariz/orelha)', price: '10,00', duration: 30 },
    { id: 'hidratacao', name: 'Hidratação', price: '15,00', duration: 30 },
    { id: 'relaxamento', name: 'Relaxamento', price: '40,00', duration: 30 },
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

const Header = ({ user }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSmoothScroll = (e) => {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            window.scrollTo({ top: targetElement.offsetTop, behavior: 'smooth' });
        }
        setIsMenuOpen(false);
    };

    return (
        <header className="bg-white text-black shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-6 py-2 flex justify-between items-center">
                <a href="/"><img src="https://i.imgur.com/eH4XWxv.jpeg" alt="Logótipo da Seu Moacir Barbearia" className="h-20 w-auto" /></a>

                <nav className="hidden md:flex space-x-6 items-center">
                    <a href="#inicio" onClick={handleSmoothScroll} className="text-lg hover:text-gray-600 transition-colors duration-300">Início</a>
                    <a href="#sobre" onClick={handleSmoothScroll} className="text-lg hover:text-gray-600 transition-colors duration-300">Sobre</a>
                    <a href="#agendamento" onClick={handleSmoothScroll} className="text-lg hover:text-gray-600 transition-colors duration-300">Agendamento</a>
                    <a href="#contato" onClick={handleSmoothScroll} className="text-lg hover:text-gray-600 transition-colors duration-300">Contato</a>
                    {user ? (
                        <a href={authorizedBarbers[user.email] ? "/admin" : "/minha-conta"} className="bg-black text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors">Minha Conta</a>
                    ) : (
                        <a href="/login" className="bg-black text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors">Entrar</a>
                    )}
                </nav>

                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Abrir menu"><Menu className="h-8 w-8 text-black" /></button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-white z-50 flex flex-col">
                    <div className="flex justify-end p-6"><button onClick={() => setIsMenuOpen(false)} aria-label="Fechar menu"><X className="h-8 w-8 text-black" /></button></div>
                    <nav className="flex flex-col items-center justify-center flex-1 space-y-8">
                        <a href="#inicio" onClick={handleSmoothScroll} className="text-3xl font-bold">Início</a>
                        <a href="#sobre" onClick={handleSmoothScroll} className="text-3xl font-bold">Sobre</a>
                        <a href="#agendamento" onClick={handleSmoothScroll} className="text-3xl font-bold">Agendamento</a>
                        <a href="#contato" onClick={handleSmoothScroll} className="text-3xl font-bold">Contato</a>
                         {user ? (
                            <a href={authorizedBarbers[user.email] ? "/admin" : "/minha-conta"} className="text-3xl font-bold text-white bg-black px-6 py-3 rounded-lg">Minha Conta</a>
                         ) : (
                            <a href="/login" className="text-3xl font-bold text-white bg-black px-6 py-3 rounded-lg">Entrar</a>
                         )}
                    </nav>
                </div>
            )}
        </header>
    );
};


const Hero = () => { /* ... (componente inalterado) ... */ };
const About = () => { /* ... (componente inalterado) ... */ };

const SchedulingSystem = ({ user }) => {
    // ... (lógica interna do sistema de agendamento)
    const [selectedService, setSelectedService] = useState(null);
    const [selectedBarber, setSelectedBarber] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(null);
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);

    useEffect(() => {
        if(user) {
            setNome(user.displayName || '');
        }
    }, [user]);

    // ... (restante da lógica do SchedulingSystem)

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!selectedService || !selectedBarber || !selectedTime || !nome || !telefone) {
            setError("Por favor, preencha todos os campos para continuar.");
            return;
        }
        setIsSubmitting(true);
        try {
            const appointmentData = {
                nome: nome,
                telefone: telefone,
                data: selectedDate.toISOString().split('T')[0],
                hora: selectedTime,
                barbeiroId: selectedBarber.id,
                barbeiroName: selectedBarber.name,
                servico: {
                    id: selectedService.id,
                    name: selectedService.name,
                    price: selectedService.price,
                    duration: selectedService.duration
                },
                timestamp: new Date(),
                status: 'confirmado' // novo campo de status
            };
            // Se o utilizador estiver logado, associa o agendamento a ele
            if (user) {
                appointmentData.clienteId = user.uid;
            }
            await addDoc(collection(db, "agendamentos"), appointmentData);
            setIsSuccess(true);
            // ... (restante da lógica de sucesso)
        } catch (err) {
            // ... (lógica de erro)
        } finally {
            setIsSubmitting(false);
        }
    };
    // ... (JSX do SchedulingSystem)
};

const SchedulingSection = ({ user }) => (<section id="agendamento" className="py-20 bg-gray-100"><div className="container mx-auto px-6"><SchedulingSystem user={user} /></div></section>);
const Contact = () => { /* ... (componente inalterado) ... */ };
const Footer = () => { /* ... (componente inalterado) ... */ };

const MainWebsite = ({ user }) => (
    <>
      <Header user={user} />
      <main>
        <Hero />
        <About />
        <SchedulingSection user={user} />
        <Contact />
      </main>
      <Footer />
    </>
);

// =================================================================================
// --- PÁGINA DE LOGIN E REGISTO ---
// =================================================================================

const AuthPage = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
            }
            onAuthSuccess();
        } catch (err) {
            // ... (lógica de erro de autenticação)
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 h-screen flex justify-center items-center p-4">
             {/* ... (JSX do formulário de login/registo) ... */}
        </div>
    );
};


// =================================================================================
// --- COMPONENTES DOS PAINÉIS (ADMIN E CLIENTE) ---
// =================================================================================

const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm("Tem a certeza de que quer cancelar este agendamento?")) {
        try {
            await deleteDoc(doc(db, "agendamentos", appointmentId));
            alert("Agendamento cancelado com sucesso!");
        } catch (error) {
            console.error("Erro ao cancelar agendamento: ", error);
            alert("Não foi possível cancelar o agendamento.");
        }
    }
};

const AdminDashboard = ({ user, onLogout }) => { /* ... (código do painel de admin, agora com botões de Cancelar/Reagendar) ... */ };

const ClientDashboard = ({ user, onLogout }) => {
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [pastAppointments, setPastAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

     useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "agendamentos"), where("clienteId", "==", user.uid), orderBy("data", "desc"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allAppointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const now = new Date();
            const upcoming = allAppointments.filter(app => new Date(app.data + 'T' + app.hora) >= now);
            const past = allAppointments.filter(app => new Date(app.data + 'T' + app.hora) < now);
            setUpcomingAppointments(upcoming);
            setPastAppointments(past);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);
    
    // ... (JSX do painel do cliente, mostrando as listas e os botões)
     return (
        <div className="bg-gray-100 min-h-screen">
            <header className="bg-black text-white shadow-md">
                 {/* ... (cabeçalho do painel) ... */}
            </header>
            <main className="container mx-auto p-6">
                {/* ... (seção de próximos agendamentos com botões) ... */}
                {/* ... (seção de histórico de agendamentos) ... */}
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

  // ... (useEffect para Tailwind e navegação)

  useEffect(() => {
    if (!auth) {
        setIsAuthenticating(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser); 
        setIsAuthenticating(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
      // Após o login/registo, o onAuthStateChanged irá tratar da atualização
      // e o router irá redirecionar com base no novo estado 'user'.
      // Apenas navegamos para a página inicial para que o router reavalie.
      window.history.pushState({}, '', '/');
      setCurrentPath('/');
  };

  const handleLogout = async () => {
      await signOut(auth);
      window.location.href = '/';
  };
  
  // Roteamento
  
  if (isAuthenticating) {
      return <LoadingScreen />;
  }
  
  // Se o utilizador está logado, decidimos para onde ele vai
  if(user) {
      const isBarber = authorizedBarbers[user.email];
      if (currentPath.startsWith('/admin') && isBarber) {
          return <AdminDashboard user={user} onLogout={handleLogout} />;
      }
      if (currentPath.startsWith('/minha-conta') && !isBarber) {
          return <ClientDashboard user={user} onLogout={handleLogout} />;
      }
      // Se um barbeiro está logado mas tenta aceder a outra página, vai para o admin
      if(isBarber) {
          window.history.replaceState({}, '', '/admin');
          return <AdminDashboard user={user} onLogout={handleLogout} />;
      }
      // Se um cliente está logado mas tenta aceder a outra página, vai para a sua conta
       if(!isBarber) {
          window.history.replaceState({}, '', '/minha-conta');
          return <ClientDashboard user={user} onLogout={handleLogout} />;
      }
  }

  // Se o utilizador não está logado
  if (currentPath.startsWith('/login')) {
      return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }
  
  if (currentPath.startsWith('/admin') || currentPath.startsWith('/minha-conta')) {
      window.history.replaceState({}, '', '/login');
      return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return <MainWebsite user={user} />;
}

// Nota: Por brevidade, o JSX de alguns componentes (Hero, About, etc.) e a lógica interna
// de outros (AdminDashboard, ClientDashboard) foram omitidos. A estrutura e a lógica principal estão presentes.
