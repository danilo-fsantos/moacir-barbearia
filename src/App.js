import React, { useState, useEffect } from 'react';

// --- IMPORTAÇÕES DO FIREBASE (ORGANIZADAS) ---
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, query, where, orderBy } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// --- IMPORTAÇÕES DE ÍCONES ---
import { Clock, MapPin, Scissors, User, Phone, CheckCircle, LogOut, Calendar, Menu, X, Tag, Mail, Lock } from 'lucide-react';

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
    {
        id: 'pedro',
        name: 'Pedro',
        imageUrl: 'https://placehold.co/200x200/cccccc/111827?text=Pedro' // Substituir pela foto real
    },
    {
        id: 'charles',
        name: 'Charles',
        imageUrl: 'https://placehold.co/200x200/cccccc/111827?text=Charles' // Substituir pela foto real
    }
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

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        // Fecha o menu mobile após o clique
        setIsMenuOpen(false);
    };

    return (
        <header className="bg-white text-black shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-6 py-2 flex justify-between items-center">
                <a href="/"><img src="https://i.imgur.com/eH4XWxv.jpeg" alt="Logótipo da Seu Moacir Barbearia" className="h-20 w-auto" /></a>

                {/* Menu para Desktop */}
                <nav className="hidden md:flex space-x-6 items-center">
                    <a href="#inicio" onClick={handleSmoothScroll} className="text-lg hover:text-gray-600 transition-colors duration-300">Início</a>
                    <a href="#sobre" onClick={handleSmoothScroll} className="text-lg hover:text-gray-600 transition-colors duration-300">Sobre</a>
                    <a href="#agendamento" onClick={handleSmoothScroll} className="text-lg hover:text-gray-600 transition-colors duration-300">Agendamento</a>
                    <a href="#contato" onClick={handleSmoothScroll} className="text-lg hover:text-gray-600 transition-colors duration-300">Contato</a>
                </nav>

                {/* Botão do Menu Mobile */}
                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Abrir menu">
                        <Menu className="h-8 w-8 text-black" />
                    </button>
                </div>
            </div>

            {/* Overlay do Menu Mobile */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-white z-50 flex flex-col">
                    <div className="flex justify-end p-6">
                         <button onClick={() => setIsMenuOpen(false)} aria-label="Fechar menu">
                            <X className="h-8 w-8 text-black" />
                        </button>
                    </div>
                    <nav className="flex flex-col items-center justify-center flex-1 space-y-8">
                        <a href="#inicio" onClick={handleSmoothScroll} className="text-3xl font-bold hover:text-gray-600 transition-colors duration-300">Início</a>
                        <a href="#sobre" onClick={handleSmoothScroll} className="text-3xl font-bold hover:text-gray-600 transition-colors duration-300">Sobre</a>
                        <a href="#agendamento" onClick={handleSmoothScroll} className="text-3xl font-bold hover:text-gray-600 transition-colors duration-300">Agendamento</a>
                        <a href="#contato" onClick={handleSmoothScroll} className="text-3xl font-bold hover:text-gray-600 transition-colors duration-300">Contato</a>
                    </nav>
                </div>
            )}
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
                    backgroundImage: "url(https://i.imgur.com/IkCGN1t.jpeg)",
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
          <img src="https://i.imgur.com/XZjosPj.jpeg" alt="Interior da Barbearia Seu Moacir" className="rounded-lg shadow-xl w-full h-auto object-cover"/>
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

    const resetSelection = () => {
        setSelectedBarber(null);
        setSelectedTime(null);
        setAppointments([]);
        setAvailableSlots([]);
    }

    // Gerador de Horários
    useEffect(() => {
        if (!selectedDate || !selectedService || !selectedBarber) {
            setAvailableSlots([]);
            return;
        }

        const dayOfWeek = selectedDate.getDay();
        if (dayOfWeek === 0) { // Domingo
            setAvailableSlots([]);
            return;
        }

        const startTime = 9 * 60; // 9:00 em minutos
        const endTime = 19 * 60; // 19:00 em minutos
        const lunchStart = 12 * 60; // 12:00 em minutos
        const lunchEnd = 14 * 60; // 14:00 em minutos
        const serviceDuration = selectedService.duration;
        const interval = 30; // base de 30 minutos

        const slots = [];
        for (let time = startTime; time < endTime; time += interval) {
            const slotEnd = time + serviceDuration;
            // Verifica se o slot não cai na hora do almoço
            const inLunch = (time >= lunchStart && time < lunchEnd) || (slotEnd > lunchStart && slotEnd <= lunchEnd);
            // Verifica se o slot termina depois do expediente
            const afterHours = slotEnd > endTime;

            if (!inLunch && !afterHours) {
                const hours = Math.floor(time / 60).toString().padStart(2, '0');
                const minutes = (time % 60).toString().padStart(2, '0');
                slots.push(`${hours}:${minutes}`);
            }
        }
        
        const bookedSlots = new Set();
        appointments.forEach(app => {
            const [appHour, appMinute] = app.hora.split(':').map(Number);
            const appStartTime = appHour * 60 + appMinute;
            const appDuration = services.find(s => s.id === app.servico.id)?.duration || 30;
            
            // Adiciona todos os intervalos de 30min que o agendamento ocupa
            for(let i = 0; i < appDuration; i += interval) {
                const bookedTime = appStartTime + i;
                const hours = Math.floor(bookedTime / 60).toString().padStart(2, '0');
                const minutes = (bookedTime % 60).toString().padStart(2, '0');
                bookedSlots.add(`${hours}:${minutes}`);
            }
        });
        
        const filteredSlots = slots.filter(slot => {
            const [slotHour, slotMinute] = slot.split(':').map(Number);
            const slotStartTime = slotHour * 60 + slotMinute;

            // Verifica se algum intervalo de 30min dentro do serviço já está ocupado
            for (let i = 0; i < serviceDuration; i += interval) {
                const timeToCheck = slotStartTime + i;
                const hours = Math.floor(timeToCheck / 60).toString().padStart(2, '0');
                const minutes = (timeToCheck % 60).toString().padStart(2, '0');
                if (bookedSlots.has(`${hours}:${minutes}`)) {
                    return false; // Slot indisponível
                }
            }
            return true; // Slot disponível
        });

        setAvailableSlots(filteredSlots);

    }, [appointments, selectedDate, selectedService, selectedBarber]);


    // Leitor de Agendamentos do Firebase
    useEffect(() => {
        if (!db || !selectedDate || !selectedBarber) {
            setAppointments([]);
            return;
        };
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const q = query(collection(db, "agendamentos"), where("data", "==", formattedDate), where("barbeiro", "==", selectedBarber.id));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const bookedAppointments = querySnapshot.docs.map(doc => doc.data());
            setAppointments(bookedAppointments);
        }, (err) => {
            console.error("Erro ao buscar agendamentos: ", err);
            setError("Não foi possível carregar os horários.");
        });

        return () => unsubscribe();
    }, [selectedDate, selectedBarber]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!selectedService || !selectedBarber || !selectedTime || !nome || !telefone) {
            setError("Por favor, preencha todos os campos para continuar.");
            return;
        }
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "agendamentos"), {
                nome: nome,
                telefone: telefone,
                data: selectedDate.toISOString().split('T')[0],
                hora: selectedTime,
                barbeiro: selectedBarber.id,
                servico: {
                    id: selectedService.id,
                    name: selectedService.name,
                    price: selectedService.price,
                    duration: selectedService.duration
                },
                timestamp: new Date()
            });
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false); setNome(''); setTelefone(''); setSelectedTime(null); setSelectedBarber(null); setSelectedService(null);
            }, 5000);
        } catch (err) {
            console.error("Erro ao agendar: ", err);
            setError("Ocorreu um erro ao tentar fazer o agendamento. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) return (
        <div className="text-center p-8 bg-green-50 border border-green-200 rounded-lg max-w-lg mx-auto">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h4 className="text-2xl font-bold text-green-800">Agendamento Confirmado!</h4>
            <p className="text-green-700 mt-2">O seu horário para <strong>{selectedService.name}</strong> com <strong>{selectedBarber.name}</strong> foi reservado com sucesso. Obrigado!</p>
        </div>
    );

    return (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl max-w-5xl mx-auto">
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-2">Faça o seu Agendamento</h3>
            <p className="text-center text-gray-500 mb-8">Rápido, fácil e online.</p>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-10">
                {/* ETAPA 1: SERVIÇOS */}
                <div>
                    <h4 className="text-lg font-bold text-gray-700 mb-4 text-center">1. Escolha o Serviço</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {services.map(s => (
                            <div key={s.id} onClick={() => { setSelectedService(s); resetSelection(); }} className={`cursor-pointer p-4 border-2 rounded-lg transition-all duration-300 ${selectedService?.id === s.id ? 'border-gray-800 bg-gray-50 scale-105 shadow-lg' : 'border-gray-200 hover:border-gray-400'}`}>
                                <p className="font-semibold text-gray-800">{s.name}</p>
                                <div className="text-sm text-gray-500 flex justify-between items-center mt-2">
                                    <span><Clock size={14} className="inline mr-1"/>{s.duration} min</span>
                                    <span className="font-bold">R$ {s.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ETAPA 2: BARBEIROS */}
                <div className={`transition-opacity duration-500 ${!selectedService ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                    <h4 className="text-lg font-bold text-gray-700 mb-4 text-center">2. Escolha o seu Barbeiro</h4>
                    <div className="flex justify-center gap-6">
                        {barbers.map(b => (
                            <div key={b.id} onClick={() => { setSelectedBarber(b); setSelectedTime(null); }} className={`cursor-pointer text-center p-4 border-2 rounded-lg transition-all duration-300 ${selectedBarber?.id === b.id ? 'border-gray-800 bg-gray-50 scale-105 shadow-lg' : 'border-gray-200 hover:border-gray-400'}`}>
                                <img src={b.imageUrl} alt={b.name} className="w-24 h-24 rounded-full mx-auto object-cover mb-2" />
                                <span className="font-semibold text-gray-800">{b.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ETAPA 3 e 4: DATA, HORA E DADOS */}
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-500 ${!selectedBarber ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                    <div>
                        <div className="mb-6">
                            <label htmlFor="date" className="block text-sm font-bold text-gray-700 mb-2">3. Escolha a data:</label>
                            <input type="date" id="date" min={new Date().toISOString().split('T')[0]} value={selectedDate.toISOString().split('T')[0]} onChange={(e) => {setSelectedDate(new Date(e.target.value + 'T00:00:00')); setSelectedTime(null);}} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800"/>
                        </div>
                        <div>
                            <p className="block text-sm font-bold text-gray-700 mb-2">4. Escolha o horário:</p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {availableSlots.length > 0 ? availableSlots.map(time => (
                                    <button type="button" key={time} onClick={() => setSelectedTime(time)} className={`p-3 rounded-lg text-center font-semibold transition-colors duration-200 ${selectedTime === time ? 'bg-gray-800 text-white ring-2 ring-gray-900' : 'bg-gray-100 text-gray-800 hover:bg-gray-300'}`}>{time}</button>
                                )) : <p className="col-span-full text-center text-gray-500 p-4 bg-gray-50 rounded-lg">Nenhum horário disponível para esta data ou serviço.</p>}
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg border">
                        <p className="block text-sm font-bold text-gray-700 mb-4">5. Os seus dados:</p>
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

const AdminLogin = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await onLogin(email, password);
            // O redirecionamento será tratado pelo componente App
        } catch (err) {
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('E-mail ou senha incorretos.');
            } else {
                setError('Ocorreu um erro. Tente novamente.');
            }
            console.error("Erro no login:", err.code);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 h-screen flex justify-center items-center p-4">
            <div className="w-full max-w-sm text-center p-8 bg-black rounded-xl shadow-2xl border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-4">Área do Barbeiro</h2>
                <p className="text-gray-400 mb-8">Faça login para ver a sua agenda.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="email"
                            placeholder="E-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-3 pl-10 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50"
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-3 pl-10 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'A entrar...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

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
                        <p className="text-sm text-gray-300">Bem-vindo, {user.displayName || user.email}!</p>
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
                                <li key={app.id} className="p-4 flex items-center justify-between hover:bg-gray-50 flex-wrap">
                                    <div className="flex items-center gap-4 mb-2 sm:mb-0">
                                        <div className="bg-black text-white font-bold p-3 rounded-lg text-center w-20">
                                            <span className="block text-2xl">{app.hora}</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-lg text-gray-800 flex items-center gap-2"><User size={18} /> {app.nome}</p>
                                            <p className="text-gray-600 flex items-center gap-2"><Phone size={16} /> {app.telefone}</p>
                                        </div>
                                    </div>
                                     <div className="w-full sm:w-auto text-right">
                                        <p className="font-semibold text-gray-700 bg-gray-200 px-3 py-1 rounded-full text-sm inline-flex items-center gap-2"><Tag size={14}/>{app.servico?.name || 'Serviço não especificado'}</p>
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
        setUser(currentUser); 
        setIsAuthenticating(false);
    });
    return () => unsubscribe();
  }, []);

  // Efeito para lidar com a navegação
  useEffect(() => {
    const onLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', onLocationChange);
    // Para lidar com a navegação inicial e refresh
    const handleInitialLoad = () => {
        // Se a URL incluir um hash, removemos para não quebrar o router
        if (window.location.hash) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        setCurrentPath(window.location.pathname);
    };
    handleInitialLoad();
    
    return () => window.removeEventListener('popstate', onLocationChange);
  }, []);

  const handleEmailPasswordLogin = async (email, password) => {
      if (!email || !password) {
        throw new Error("E-mail e senha são obrigatórios.");
      }
      return signInWithEmailAndPassword(auth, email, password);
  };

  const handleLogout = async () => {
      await signOut(auth);
      window.location.href = '/'; // Redireciona para a página principal após o logout
  };
  
  // Renderização
  
  if (isAuthenticating) {
      return <LoadingScreen />;
  }
  
  if (currentPath.startsWith('/admin')) {
      const isAuthorized = user && authorizedBarbers[user.email];
      if (isAuthorized) {
          return <AdminDashboard user={user} onLogout={handleLogout} />;
      }
      return <AdminLogin onLogin={handleEmailPasswordLogin} />;
  }

  return <MainWebsite />;
}
