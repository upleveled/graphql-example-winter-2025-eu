import Image from 'next/image';
import smilingCat from '../public/images/smiling-cat.webp';

export default function HomePage() {
  return (
    <div>
      <h1>Hello UpLeveled!</h1>
      {/* This is not ideal because its not optimized */}
      <img src="/images/smiling-cat.webp" alt="Smiling cat" />

      {/* These are optimized and the ideal way to use image in Next.js */}
      <Image
        src="/images/smiling-cat.webp"
        alt="Smiling cat"
        width={400}
        height={300}
      />
      <Image src={smilingCat} alt="Smiling cat" />
    </div>
  );
}
