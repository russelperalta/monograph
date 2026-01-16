import styles from "../styles/home.module.scss";
import { client } from '../../sanity/lib/client';
import { urlFor } from '../../sanity/lib/image';
import type { PortableTextBlock } from '@portabletext/react';
import Link from 'next/link';
import SplitScreenScroll from './components/SplitScreen/SplitScreen';
import imageUrlBuilder from '@sanity/image-url';

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  leftImage?: any;
  leftPreviewImage?: any;
  rightImage?: any;
  leftBody?: PortableTextBlock[];
  rightBody?: PortableTextBlock[];
  projectYear: string;
  gallery?: any[];
  order?: number;
  // Add New Fields (Step 1)
}
export interface PostWithUrl extends Omit<Post, 'leftImage' | 'leftPreviewImage' | 'rightImage' | 'leftBody' | 'rightBody' | 'projectYear'> {
  leftImageUrl: string;
  leftPreviewImageUrl: string;
  rightImageUrl: string;
  year: string;
  leftContent: PortableTextBlock[];
  rightContent: PortableTextBlock[];
  gallery: any[];
}

// Transform post data
function transformPost(post: Post): PostWithUrl {
  return {
    ...post,
    leftImageUrl: post.leftImage ? urlFor(post.leftImage).width(1200).url() : '',
    leftPreviewImageUrl: post.leftPreviewImage ? urlFor(post.leftPreviewImage).width(1200).url() : '',
    rightImageUrl: post.rightImage ? urlFor(post.rightImage).width(1200).url() : '',
    year: post.projectYear?.toString() || '',
    leftContent: post.leftBody || [],
    rightContent: post.rightBody || [],
    gallery: post.gallery || [],
  };
}

async function getPosts(): Promise<PostWithUrl[]> {
  const posts: Post[] = await client.fetch(`
    *[_type == "post"] | order(order asc, publishedAt desc) {
      _id,
      title,
      slug,
      projectYear,
      leftImage,
      leftPreviewImage,
      rightImage,
      leftBody,
      rightBody,
      gallery,
      order,
      }
    `);
    // Add New Fields in query (Step 2)
  
  return posts.map(transformPost);
}

export default async function Home() {
  const posts = await getPosts();

  if (!posts.length) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <p style={{ padding: '2rem', color: 'white' }}>No posts found</p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <SplitScreenScroll posts={posts} />
      </main>
    </div>
  );
}