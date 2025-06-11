import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";

function validateEmail(email: string) {
  // Simple email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ContactModal({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [replyEmail, setReplyEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!title || !content || !replyEmail) {
      setError(t.contact.errorRequired);
      return;
    }
    if (!validateEmail(replyEmail)) {
      alert(t.contact.errorInvalidEmail);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, replyEmail }),
      });
      if (res.ok) {
        setSuccess(true);
        setTitle("");
        setContent("");
        setReplyEmail("");
      } else {
        setError(t.contact.errorSubmit);
      }
    } catch {
      setError(t.contact.errorSubmit);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700">{t.contact.close}</button>
        <h2 className="text-2xl font-bold mb-4 text-center">{t.contact.title}</h2>
        {success ? (
          <div className="text-green-600 text-center font-semibold py-8">{t.contact.success}</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder={t.contact.titlePlaceholder}
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <textarea
              placeholder={t.contact.contentPlaceholder}
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              rows={5}
              className="px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="email"
              placeholder={t.contact.emailPlaceholder}
              value={replyEmail}
              onChange={e => setReplyEmail(e.target.value)}
              required
              className="px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? t.contact.submitting : t.contact.submit}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 