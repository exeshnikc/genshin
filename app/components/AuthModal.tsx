'use client';
import { useState } from 'react';

export function AuthModal({ isOpen, onClose }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const payload = isLogin ? { email, password } : { email, password, name };
        
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.reload(); // Обновляем состояние
        } else {
            alert(data.error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#2A2438] rounded-2xl p-8 w-96 border border-amber-200 dark:border-amber-800/30 shadow-2xl">
                <h2 className="text-2xl font-serif text-center text-amber-800 dark:text-amber-400 mb-6">
                    {isLogin ? 'Возвращение в Тейват' : 'Путь Странника'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <input type="text" placeholder="Имя Странника" value={name} onChange={(e) => setName(e.target.value)} 
                               className="w-full p-3 border border-stone-200 dark:border-stone-700 rounded-xl bg-transparent" required />
                    )}
                    <input type="email" placeholder="Почта Фатуи" value={email} onChange={(e) => setEmail(e.target.value)} 
                           className="w-full p-3 border border-stone-200 dark:border-stone-700 rounded-xl bg-transparent" required />
                    <input type="password" placeholder="Ключ Созвездия" value={password} onChange={(e) => setPassword(e.target.value)} 
                           className="w-full p-3 border border-stone-200 dark:border-stone-700 rounded-xl bg-transparent" required />
                    <button type="submit" className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-700 text-white rounded-xl font-bold">
                        {isLogin ? 'Войти в Архив' : 'Начать Путешествие'}
                    </button>
                </form>
                <p className="text-center text-sm mt-4 text-stone-500">
                    {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
                    <button onClick={() => setIsLogin(!isLogin)} className="text-amber-600 hover:underline">
                        {isLogin ? 'Создать Связь' : 'Войти в Облако'}
                    </button>
                </p>
            </div>
        </div>
    );
}