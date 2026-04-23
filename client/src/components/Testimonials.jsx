import React from 'react';
import { Star } from 'lucide-react';
import './Testimonials.css';

export default function Testimonials() {
  const testimonials = [
    {
      text: "Eu costumava depender de grupos de WhatsApp e sempre tinha medo de deixar estranhos entrarem na minha casa. Com o EsponJÁ, saber que todos passam por uma verificação de antecedentes me dá paz de espírito absoluta.",
      author: "Mariana S.",
      role: "Dona de Casa",
      initial: "M"
    },
    {
      text: "Contratei um eletricista e fiquei impressionado com a pontualidade. O sistema de confirmação ativa realmente funciona! O trabalho foi perfeito e, honestamente, tirou todo o estresse do processo.",
      author: "Carlos P.",
      role: "Locatário",
      initial: "C"
    },
    {
      text: "Anteriormente, tive um serviço de encanamento mal feito e o cara simplesmente desapareceu. A garantia de refação do EsponJÁ me deu confiança para contratar de novo, e desta vez o profissional foi excelente.",
      author: "Juliana T.",
      role: "Proprietária",
      initial: "J"
    }
  ];

  return (
    <section id="testimonials" className="section testimonials">
      <div className="container">
        <div className="text-center">
          <h2 className="section-title">Confiado por Centenas de Lares</h2>
          <p className="section-subtitle">
            Veja como estamos mudando a forma como as pessoas contratam serviços domésticos, focando em confiança, qualidade e garantia.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((test, index) => (
            <div key={index} className="testimonial-card">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill="currentColor" />
                ))}
              </div>
              <p className="testimonial-text">"{test.text}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">{test.initial}</div>
                <div className="author-info">
                  <h4>{test.author}</h4>
                  <p>{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
