export const generateSlug = async (name, prisma) => {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, "-");

  let slug = baseSlug;

  let counter = 1;

  while (true) {
    const exists = await prisma.companyProfile.findUnique({
      where: { slug },
    });

    if (!exists) break;

    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
};
