import { PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
    { name: 'Web Development', slug: 'web-development' },
    { name: 'Programming Languages', slug: 'programming-languages' },
    { name: 'Database Design', slug: 'database-design' },
    { name: 'Mobile Development', slug: 'mobile-development' },
    { name: 'Data Science', slug: 'data-science' },
    { name: 'Software Development Tools', slug: 'software-development-tools' },
]

const topics = {
    'web-development': [
        { name: 'HTML', slug: 'html' },
        { name: 'CSS', slug: 'css' },
        { name: 'JavaScript', slug: 'javascript' },
        { name: 'React', slug: 'react' },
        { name: 'Node.js', slug: 'node-js' },
        { name: 'Next.js', slug: 'next-js' },
    ],
    'programming-languages': [
        { name: 'JavaScript', slug: 'javascript' },
        { name: 'Python', slug: 'python' },
        { name: 'Java', slug: 'java' },
        { name: 'C#', slug: 'c-sharp' },
        { name: 'Ruby', slug: 'ruby' },
    ],
    'database-design': [
        { name: 'SQL', slug: 'sql' },
        { name: 'Normalization', slug: 'normalization' },
        { name: 'Indexes', slug: 'indexes' },
        { name: 'Database Security', slug: 'database-security' },
    ],
    'mobile-development': [
        { name: 'Android', slug: 'android' },
        { name: 'iOS', slug: 'ios' },
        { name: 'React Native', slug: 'react-native' },
        { name: 'Flutter', slug: 'flutter' },
    ],
    'data-science': [
        { name: 'Python for Data Science', slug: 'python-data-science' },
        { name: 'Machine Learning', slug: 'machine-learning' },
        { name: 'Deep Learning', slug: 'deep-learning' },
        { name: 'Statistics', slug: 'statistics' },
    ],
    'software-development-tools': [
        { name: 'Git', slug: 'git' },
        { name: 'Docker', slug: 'docker' },
        { name: 'VS Code', slug: 'vs-code' },
        { name: 'Jira', slug: 'jira' },
        { name: 'CI/CD', slug: 'ci-cd' },
    ],
}

async function seedCategories() {
    // return categories.map((category) =>
    //     prisma.category.upsert({
    //         where: { slug: category.slug },
    //         update: {},
    //         create: category,
    //     })
    // )
}

async function seedTopics() {
    // const topicOperations: any[] = []
    // for (const [slug, topicData] of Object.entries(topics)) {
    //     const category = await prisma.category.findUnique({
    //         where: { slug },
    //     })
    //
    //     if (category) {
    //         const topicUpserts = topicData.map((topic) =>
    //             prisma.topic.upsert({
    //                 where: { slug: topic.slug },
    //                 update: {},
    //                 create: {
    //                     ...topic,
    //                     categoryId: category.id,
    //                 },
    //             })
    //         )
    //         topicOperations.push(...topicUpserts)
    //     } else {
    //         console.log(`Category with slug "${slug}" not found, skipping topics for this category.`);
    //     }
    // }
    //
    // return topicOperations
}


async function main() {
    const startTime = Date.now()
    try {
        // const categoryOperations = await seedCategories();
        // await prisma.$transaction(categoryOperations);
        //
        // const topicOperations = await seedTopics();
        // await prisma.$transaction(topicOperations);
        //
        // const endTime = Date.now()
        // console.log(`Seeding completed in ${((endTime - startTime) / 1000).toFixed(2)} seconds`)
    } catch (error) {
        console.error('Error during seeding: ', error)
    } finally {
        await prisma.$disconnect()
    }

}

main().then(async () => {
        await prisma.$disconnect();
    }).catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });