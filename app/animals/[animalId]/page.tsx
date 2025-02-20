import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { getAnimalInsecure } from '../../../database/animals';

export async function generateMetadata(props: Props) {
  const singleAnimal = await getAnimalInsecure(
    Number((await props.params).animalId),
  );
  return {
    title: singleAnimal?.firstName,
    description: 'This is my single animal page ',
  };
}

type Props = {
  params: Promise<{
    animalId: string;
  }>;
};

export default async function AnimalPage(props: Props) {
  const singleAnimal = await getAnimalInsecure(
    Number((await props.params).animalId),
  );

  if (!singleAnimal) {
    return (
      <div>
        <h1>Animal not found</h1>
        <Link href="/animals">Go back to animals</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>{singleAnimal.firstName}</h1>
      <div>
        <Image
          src={`/images/${singleAnimal.firstName.toLowerCase()}.webp`}
          alt={singleAnimal.firstName}
          width={300}
          height={300}
        />
        this is a {singleAnimal.type} carrying {singleAnimal.accessory}
      </div>
    </div>
  );
}
