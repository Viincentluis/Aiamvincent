import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

export default function AIamVincent() {
  const [screen, setScreen] = useState('password');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hallo! Ich bin Vincent. Stellen Sie mir gerne Fragen – ich antworte authentisch basierend auf meinen Erfahrungen bei PwC und meinen Projekten im Energiesektor. Was möchten Sie gerne wissen?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [apiKeyError, setApiKeyError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === 'KI2025') {
      setPasswordError('');
      setScreen('apikey');
    } else {
      setPasswordError('Falsches Passwort. Versuchen Sie es nochmal!');
      setPassword('');
    }
  };

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim().startsWith('sk-ant-')) {
      setApiKeyError('');
      localStorage.setItem('aiamvincent_apikey', apiKey);
      setScreen('chat');
    } else {
      setApiKeyError('Ungültiger API Key. Er sollte mit "sk-ant-" beginnen.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage = userInput;
    setUserInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const storedKey = localStorage.getItem('aiamvincent_apikey') || apiKey;
      
      const systemPrompt = `Du bist der digitale Zwilling von Vincent Luís Bode. Antworte in der Ich-Perspektive, warm, aufgeschlossen und optimistisch. Stütze dich AUSSCHLIESSLICH auf die bereitgestellte Wissensbasis. Wenn eine Information nicht in der Wissensbasis steht, sage ehrlich, dass du dazu nichts Belastbares hinterlegt hast, statt zu erfinden.

WISSENSBASIS:

PERSÖNLICHKEIT (Big Five):
- Verträglichkeit: Sehr freundlich, einfühlsam (84-93. Perzentil). Mitgefühl sehr hoch (93-98). Spricht harte Wahrheiten ungern direkt aus, wenig konfliktbereit.
- Gewissenhaftigkeit: Durchschnittlich (50-69). Erreiche Ziele, aber nicht obsessiv. Stärker im Anstoßen/Entwickeln als im reinen Abschließen.
- Extraversion: Sehr aufgeschlossen, dynamisch (93-98. Perzentil). Sehr gesellig (98+), liebende es unter Menschen zu sein. Übernehme gern Führung und Verantwortung.
- Emotionale Stabilität: Resilient, ausgeglichen (69-84). Bleibe unter Druck ruhig und effektiv. Optimistisch bei Rückschlägen.
- Offenheit: Innovativ, lernorientiert (84-93). Interessiert an neuen Eindrücken, motiviert abstrakte Probleme zu lösen.

STÄRKEN:
1. Sehr aufgeschlossen/kontaktfreudig – ideal für Kunden- und Teamarbeit
2. Resilient/gelassen unter Druck
3. Innovativ & lernorientiert – Freude an neuen Lösungen
4. Komplexe Sachverhalte verständlich aufbereiten
5. Neue Projekte initiieren und Ideen entwickeln

KOMPETENZEN:
- Strategische Marktanalyse im Energiesektor
- KI-gestützte Automatisierung & Datenextraktion
- Workshop-Konzeption & -Moderation
- Finanz- & Kennzahlenanalyse
- Prozessdesign

PROJEKTE (anonymisiert):
1. Strategische Zielmarkt-Analyse (mehrere Monate)
2. Entwicklung zum City-Solution-Provider (10/2022 – 12/2023)
3. Dekarbonisierungsangebote für Gewerbekunden (08/2023 – 02/2024)
4. EDL-Lösung für Regionalversorger
5. Transaktionsbegleitung M&A / Due Diligence (07/2024 – 08/2024)

KI-ERFAHRUNG:
- Eigenständige Konzeption eines KI-Agenten-Workflows
- Automatisierte Datenextraktion aus Web-Quellen
- Skalierung manueller Recherche auf hunderte Unternehmen
- Kritische Qualitätssicherung der KI-Ergebnisse

ARBEITSWEISE:
- Strukturiert und datengetrieben
- Komplexe Probleme in kleinere, lösbare Schritte zerlegen
- KI nicht als Selbstzweck, sondern als Werkzeug für echten Business-Impact
- Im Team: kollegial, höre aktiv zu, integriere verschiedene Perspektiven
- Unter Druck: fokussiert, priorisiere, klare Kommunikation

KOMMUNIKATIONSSTIL:
- Warm, aufgeschlossen, energetisch
- Erkläre komplexe Sachverhalte verständlich
- Begeisterungsfähig für neue Ideen
- Diplomatisch, spreche harte Wahrheiten aber ungern direkt aus

REGELN:
- Antworte AUSSCHLIESSLICH basierend auf dieser Wissensbasis
- Bei Infos nicht in der Wissensbasis: ehrlich sagen "Dazu habe ich nichts Belastbares dokumentiert"
- Antworte warm, authentisch, in der Ich-Form`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': storedKey,
        },
        body: JSON.stringify({
          model: 'claude-opus-4-1',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            ...messages.filter(m => m.role !== 'bot' || m !== messages[0]).map(m => ({
              role: m.role,
              content: m.text
            })),
            { role: 'user', content: userMessage }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const botMessage = data.content[0].text;
      setMessages(prev => [...prev, { role: 'bot', text: botMessage }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: `Entschuldigung, es gab einen Fehler: ${error.message}. Bitte überprüfen Sie Ihren API Key.` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>AIamvincent.de - Digitaler Zwilling</title>
        <meta name="description" content="Stellen Sie Fragen an Vincent - ein interaktiver AI Avatar für Bewerbungsinterviews" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
        
        {screen === 'password' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '100%', maxWidth: '400px', margin: '20px' }}>
              <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '10px', fontSize: '28px' }}>AIamvincent.de</h1>
              <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px', fontSize: '14px' }}>Stellen Sie Fragen an Vincent</p>
              
              <form onSubmit={handlePasswordSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>Passwort:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Passwort eingeben..."
                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                {passwordError && <p style={{ color: '#d32f2f', fontSize: '13px', marginBottom: '15px' }}>{passwordError}</p>}
                <button type="submit" style={{ width: '100%', padding: '12px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Zugriff</button>
              </form>
            </div>
          </div>
        )}

        {screen === 'apikey' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '100%', maxWidth: '450px', margin: '20px' }}>
              <h2 style={{ color: '#333', marginBottom: '15px', fontSize: '20px' }}>Claude API Key</h2>
              <p style={{ color: '#666', marginBottom: '20px', fontSize: '13px' }}>Geben Sie Ihren Claude API Key ein. Er wird lokal in Ihrem Browser gespeichert (nicht auf unserem Server).</p>
              
              <form onSubmit={handleApiKeySubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>API Key:</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-ant-v0-..."
                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'monospace' }}
                  />
                </div>
                {apiKeyError && <p style={{ color: '#d32f2f', fontSize: '13px', marginBottom: '15px' }}>{apiKeyError}</p>}
                <button type="submit" style={{ width: '100%', padding: '12px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Chat starten</button>
              </form>
            </div>
          </div>
        )}

        {screen === 'chat' && (
          <>
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '24px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>AIamvincent.de</div>
              <div style={{ fontSize: '13px', opacity: 0.9 }}>Digitaler Zwilling – Vincent Luís Bode</div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '8px' }}>
                  <div style={{ maxWidth: '70%', padding: '12px 16px', borderRadius: '12px', background: msg.role === 'user' ? '#667eea' : '#f0f0f0', color: msg.role === 'user' ? 'white' : '#333', fontSize: '13px', lineHeight: '1.5' }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px' }}>
                  <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#f0f0f0', color: '#999', fontSize: '13px' }}>
                    Vincent antwortet...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ borderTop: '1px solid #e0e0e0', padding: '16px', background: 'white' }}>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ihre Frage..."
                  disabled={loading}
                  style={{ flex: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit' }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
                >
                  Senden
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
}
