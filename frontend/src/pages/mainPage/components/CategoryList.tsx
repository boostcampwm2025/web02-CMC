import BattleCategoryCard from './BattleCategoryCard';
import { BATTLE_CATEGORY_CONFIG } from '../types/battle';

const BATTLE_CATEGORIES = Object.values(BATTLE_CATEGORY_CONFIG).slice(0, 3);

export default function CategoryList() {
  return (
    <section>
      <div className="mt-6 grid grid-cols-3 gap-6">
        {BATTLE_CATEGORIES.map((c) => (
          <BattleCategoryCard key={c.key} title={c.title} description={c.description} />
        ))}
      </div>
    </section>
  );
}
