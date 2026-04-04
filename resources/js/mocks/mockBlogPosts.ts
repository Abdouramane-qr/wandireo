/**
 * @file mockBlogPosts.ts
 * @description Articles de blog factices pour Wandireo.com.
 *
 * 6 articles : 4 PUBLISHED, 2 DRAFT.
 * Auteur : admin_001 (Wandireo Admin).
 */

import { BlogStatusNames  } from '@/types/blog';
import type {BlogPost} from '@/types/blog';

export const mockBlogPosts: BlogPost[] = [
    {
        id: 'blog_001',
        slug: 'top-5-activites-nautiques-cote-azur',
        title: "Top 5 des activités nautiques sur la Côte d'Azur",
        excerpt:
            "Entre snorkeling, kayak de mer et croisières au coucher du soleil, la Côte d'Azur regorge d'expériences aquatiques inoubliables. Découvrez notre sélection.",
        content: `<h2>La Côte d'Azur, paradis nautique</h2>
<p>La Côte d'Azur attire chaque année des millions de voyageurs en quête de soleil et de mer. Mais au-delà des plages, c'est un véritable terrain de jeu nautique qui s'offre aux aventuriers.</p>
<h3>1. Plongée sous-marine à Marseille</h3>
<p>Le Parc National des Calanques abrite des fonds marins exceptionnels. Avec une visibilité pouvant atteindre 30 mètres, c'est l'un des spots de plongée les plus prisés de Méditerranée.</p>
<h3>2. Kayak de mer entre les calanques</h3>
<p>Pagayez entre les falaises blanches et les eaux turquoise. Une expérience accessible à tous niveaux, seul ou en groupe.</p>
<h3>3. Croisière au coucher du soleil depuis Nice</h3>
<p>Embarquez pour une croisière en catamaran et regardez le soleil se coucher sur la Méditerranée. Un moment magique à partager en famille ou en amoureux.</p>
<h3>4. Stand-up paddle à Antibes</h3>
<p>Antibes offre des conditions idéales pour le SUP grâce à ses eaux calmes et ses panoramas sur le fort Carré.</p>
<h3>5. Observation des dauphins au large de Toulon</h3>
<p>Des sorties en mer permettent d'observer les dauphins communs dans leur habitat naturel. Une expérience éducative et émouvante.</p>`,
        coverImage:
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        authorId: 'admin_001',
        status: BlogStatusNames.PUBLISHED,
        tags: ['nautique', 'cote-azur', 'activites', 'plongee', 'kayak'],
        publishedAt: new Date('2026-02-10'),
        updatedAt: new Date('2026-03-01'),
    },
    {
        id: 'blog_002',
        slug: 'guide-complet-lanzarote-voyageur',
        title: 'Guide complet de Lanzarote pour le voyageur curieux',
        excerpt:
            "Volcans noirs, vignes en creux, plages dorées et mer turquoise : Lanzarote est une île aux contrastes saisissants. Voici tout ce qu'il faut savoir avant de partir.",
        content: `<h2>Lanzarote, l'île du feu</h2>
<p>Classée Réserve de la Biosphère par l'UNESCO depuis 1993, Lanzarote fascine par ses paysages lunaires façonnés par les éruptions volcaniques du XVIIIe siècle.</p>
<h3>Quand partir ?</h3>
<p>Le climat est agréable toute l'année. Les mois de mars à mai et de septembre à novembre offrent des températures idéales pour les activités de plein air.</p>
<h3>Incontournables</h3>
<ul>
  <li><strong>Parc National de Timanfaya</strong> : promenez-vous sur les laves refroidies et assistez aux démonstrations géothermiques.</li>
  <li><strong>Jameos del Agua</strong> : un jardin souterrain unique aménagé par César Manrique dans une cavité volcanique.</li>
  <li><strong>Playa Papagayo</strong> : des criques protégées aux eaux cristallines, accessibles depuis Playa Blanca.</li>
</ul>
<h3>Activités à ne pas manquer</h3>
<p>L'observation des cétacés au large de l'île est une expérience exceptionnelle. Des dauphins et parfois des baleines fréquentent les eaux canariennes.</p>`,
        coverImage:
            'https://images.unsplash.com/photo-1589308454676-22f1e8353f27?auto=format&fit=crop&w=1200&q=80',
        authorId: 'admin_001',
        status: BlogStatusNames.PUBLISHED,
        tags: ['lanzarote', 'canaries', 'guide', 'volcan', 'nature'],
        publishedAt: new Date('2026-02-18'),
        updatedAt: new Date('2026-02-18'),
    },
    {
        id: 'blog_003',
        slug: 'conseils-premiere-reservation-bateau',
        title: '5 conseils essentiels pour votre première location de bateau',
        excerpt:
            "Vous envisagez de louer un bateau pour la première fois ? Voici les points à vérifier avant de signer pour naviguer l'esprit tranquille.",
        content: `<h2>Louer un bateau : ce qu'il faut savoir</h2>
<p>La location de bateau offre une liberté incomparable pour explorer les côtes et les îles. Mais avant de prendre le large, quelques vérifications s'imposent.</p>
<h3>1. Vérifiez si un permis est requis</h3>
<p>En France, un permis bateau est obligatoire dès 6 CV en mer. Certaines locations proposent des bateaux sans permis (moins de 6 CV ou bateaux électriques).</p>
<h3>2. Comprenez les modes de location</h3>
<p>Location avec skipper, sans skipper ou en bareboat : chaque formule a ses avantages. Pour un premier voyage, le skipper est recommandé.</p>
<h3>3. Vérifiez la caution et les assurances</h3>
<p>La caution peut atteindre plusieurs milliers d'euros. Vérifiez si votre carte bancaire couvre les dommages ou souscrivez une assurance tierce.</p>
<h3>4. Consultez la météo</h3>
<p>La météo marine change vite. Consultez Météo France Marine et n'hésitez pas à annuler si les conditions sont défavorables.</p>
<h3>5. Faites l'inventaire du bord</h3>
<p>Vérifiez la présence des équipements de sécurité obligatoires (gilets, fusées, extincteur) et leur date de validité.</p>`,
        coverImage:
            'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80',
        authorId: 'admin_001',
        status: BlogStatusNames.PUBLISHED,
        tags: ['bateau', 'location', 'conseils', 'navigation', 'debutant'],
        publishedAt: new Date('2026-03-05'),
        updatedAt: new Date('2026-03-05'),
    },
    {
        id: 'blog_004',
        slug: 'paris-ses-secrets-eau',
        title: "Paris et ses secrets sur l'eau : à la découverte de la Seine",
        excerpt:
            "La Seine traverse Paris depuis des siècles, témoin silencieux de son histoire. Croisières, promenades et restaurants flottants : redécouvrez la capitale depuis l'eau.",
        content: `<h2>La Seine, artère vivante de Paris</h2>
<p>Avec ses 13 kilomètres traversant la capitale, la Seine est bien plus qu'un fleuve : c'est le miroir de l'histoire parisienne.</p>
<h3>Croisières nocturnes</h3>
<p>Le soir, Paris s'illumine et la Seine reflète les lumières de la Tour Eiffel, du Louvre et de Notre-Dame. Une croisière nocturne est sans doute la meilleure façon de découvrir ces monuments.</p>
<h3>Les ports méconnus</h3>
<p>Le Port de l'Arsenal, le Port des Champs-Élysées et le Port de Javel abritent des péniches habitées et des clubs nautiques. Un Paris authentique loin des circuits touristiques.</p>
<h3>Les îles de la Seine</h3>
<p>L'Île de la Cité et l'Île Saint-Louis concentrent à elles deux des siècles d'histoire. À découvrir à pied après une croisière.</p>`,
        coverImage:
            'https://images.unsplash.com/photo-1499856374-3da4c2c5b82a?auto=format&fit=crop&w=1200&q=80',
        authorId: 'admin_001',
        status: BlogStatusNames.PUBLISHED,
        tags: ['paris', 'seine', 'croisiere', 'nuit', 'culture'],
        publishedAt: new Date('2026-03-15'),
        updatedAt: new Date('2026-03-20'),
    },
    {
        id: 'blog_005',
        slug: 'hebergements-insolites-france',
        title: 'Les hébergements insolites en France : dormir autrement',
        excerpt:
            "Cabane dans les arbres, péniche aménagée, riad en Provence... Les hébergements insolites se multiplient en France. Notre tour d'horizon des expériences les plus mémorables.",
        content: `<h2>Brouillon en cours de rédaction</h2><p>Cet article est en cours de rédaction.</p>`,
        coverImage:
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
        authorId: 'admin_001',
        status: BlogStatusNames.DRAFT,
        tags: ['hebergement', 'insolite', 'france', 'voyage'],
        publishedAt: null,
        updatedAt: new Date('2026-03-25'),
    },
    {
        id: 'blog_006',
        slug: 'roadtrip-corse-guide-preparation',
        title: 'Roadtrip en Corse : le guide de préparation ultime',
        excerpt:
            "La Corse se mérite. Entre maquis, cols de montagne et criques sauvages, préparez votre roadtrip à travers l'Île de Beauté avec notre guide complet.",
        content: `<h2>Brouillon en cours de rédaction</h2><p>Cet article est en cours de rédaction.</p>`,
        coverImage:
            'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1200&q=80',
        authorId: 'admin_001',
        status: BlogStatusNames.DRAFT,
        tags: ['corse', 'roadtrip', 'guide', 'france'],
        publishedAt: null,
        updatedAt: new Date('2026-03-28'),
    },
];
