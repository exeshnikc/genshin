'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Book {
  id: string;
  title: string;
  author: string;
  region: string;
  content: string;
  coverUrl: string | null;
}

export default function BookPage() {
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTerm, setActiveTerm] = useState('');
  const [explanation, setExplanation] = useState('');
  const [explaining, setExplaining] = useState(false);

  useEffect(() => {
    fetch(`/api/books/${id}`)
      .then(res => res.json())
      .then(data => {
        setBook(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!book?.content) return;

    const terms = ['Архонт', 'Teyvat', 'Глаз Бога', 'Бездна', 'Фатуи', 'Путешественник', 'Паймон', 'Мондштадт', 'Ли Юэ', 'Инадзума'];
    
    const container = document.getElementById('book-content');
    if (!container) return;

    let html = book.content;
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      html = html.replace(regex, `<span class="highlight-term" data-term="$1">$1</span>`);
    });
    container.innerHTML = html;

    document.querySelectorAll('.highlight-term').forEach(el => {
      el.addEventListener('click', async (e) => {
        const term = el.getAttribute('data-term') || el.textContent || '';
        setActiveTerm(term);
        setShowModal(true);
        setExplaining(true);
        
        const res = await fetch('/api/ai/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ term })
        });
        const data = await res.json();
        setExplanation(data.explanation);
        setExplaining(false);
      });
    });
  }, [book?.content]);

  if (loading) return <div className="reader-container"><div className="loading-spinner"></div></div>;
  if (!book) return <div className="reader-container">Книга не найдена</div>;

  return (
    <div className="reader-container">
      <div className="book-header">
        <h1>{book.title}</h1>
        <div className="book-meta">
          <span>{book.author}</span>
          <span>{book.region}</span>
        </div>
      </div>
      <div id="book-content" className="reader-content"></div>

      {showModal && (
        <div className="term-modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>{activeTerm}</h2>
              <span className="close-modal" onClick={() => setShowModal(false)}>×</span>
            </div>
            <div className="modal-body">
              {explaining ? <div className="loading-spinner"></div> : <p>{explanation}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}