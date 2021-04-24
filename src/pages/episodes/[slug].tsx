import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import { api } from '../../services/api';
import { convertDurationToString } from '../../utils/convertDurationToString';

import styles from './episode.module.scss'; 

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  duration: number;
  members: string;
  durationAsString: string;
  url: string;
  publishedAt: string;
}

type EpisodeProps = {
  episode: Episode;
}

export default function Episodes({episode}: EpisodeProps) {
  const {play} = usePlayer();

  return (
    <div className={styles.episode}>

      <Head>
        <title>{episode.title}</title>
      </Head>

      <div className={styles.thumbnailContainer}>
        <Link href={'/'}>
        <button type="button">
          <img src="/arrow-left.svg" alt="Voltar"/>
        </button>
        </Link>

        <Image 
          width={700}
          height={160}
          src={episode.thumbnail}
          objectFit="cover"
        />
        <button type="button" onClick={() => play(episode)}>
          <img src="/play.svg" alt="Tocar episódio"/>
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div className={styles.description} dangerouslySetInnerHTML={{__html: episode.description}} />
    </div>
  )
}

//O episódio é dinâmico, pois existem vários, por isso é necessário o staticPaths
//Página estática com parâmetros 
//pode colocar páginas no paths para serem criadas de forma estática na build, fallback blocking faz com que as outras sejam criadas só quando acessadas
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const {slug} = ctx.params;

  const {data} = await api.get(`/episodes/${slug}`)

  const episode = {
    id: data.id,
      title: data.title,
      thumbnail: data.thumbnail,
      members: data.members,
      publishedAt: format(parseISO(data.published_at), 'd MMM yy', {locale: ptBR}),
      duration: Number(data.file.duration),
      durationAsString: convertDurationToString(Number(data.file.duration)),
      description: data.description,
      url: data.file.url
  }

  return {
    props: {
      episode
    },
    revalidate: 60 * 60 * 24, //24 horas
  }
}