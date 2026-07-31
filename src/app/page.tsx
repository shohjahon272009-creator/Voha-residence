 
 
 
 
 
import HomePage from './[lang]/page';

export default async function RootPage() {
  return <HomePage params={Promise.resolve({ lang: 'uz' })} />;
}
