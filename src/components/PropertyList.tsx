import { useEffect, useState } from 'react';
import { getProperties, Property, resolveAssetUrl } from '../services/api';

// Lista de imóveis consumindo o backend Flask
export default function PropertyList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getProperties();
        if (!isMounted) return;
        setProperties(data);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Falha ao carregar imóveis');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <p className="text-slate-600">A carregar imóveis...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!properties.length) return <p className="text-slate-600">Nenhum imóvel disponível.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <article
          key={property.id}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <img
            src={resolveAssetUrl(property.image || property.image_url, 'https://via.placeholder.com/600x400?text=Im%C3%B3vel')}
            alt={property.title}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
          <div className="p-4 space-y-2">
            <h3 className="text-lg font-bold text-slate-900">{property.title}</h3>
            <p className="text-sm text-slate-600">{property.location}</p>
            <p className="text-yellow-600 font-semibold">
              {Number(property.price).toLocaleString('pt-PT', {
                style: 'currency',
                currency: 'EUR',
              })}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
