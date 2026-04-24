import axios from "axios";

const TRAILHEAD_PROFILE_URL = "https://profile.api.trailhead.com/graphql";

const QUERY_RANK = `
  fragment TrailheadRank on TrailheadRank {
    __typename title requiredPointsSum requiredBadgesCount imageUrl
  }
  fragment LearnerStatusLevel on LearnerStatusLevel {
    __typename statusName title level imageUrl completedAt progress
  }
  query GetTrailblazerRank($slug: String, $hasSlug: Boolean!) {
    profile(slug: $slug) @include(if: $hasSlug) {
      ... on PublicProfile {
        __typename
        trailheadStats {
          __typename
          earnedPointsSum
          earnedBadgesCount
          completedTrailCount
          rank { ...TrailheadRank }
          nextRank { ...TrailheadRank }
          learnerStatusLevels { ...LearnerStatusLevel }
        }
      }
      ... on PrivateProfile { __typename }
    }
  }
`;

const QUERY_CERTIFICATIONS = `
  query GetUserCertifications($slug: String, $hasSlug: Boolean!) {
    profile(slug: $slug) @include(if: $hasSlug) {
      __typename
      id
      ... on PublicProfile {
        credential {
          brands { __typename id name logo }
          certifications {
            title
            product
            status { __typename title expired date color order }
            dateCompleted
            dateExpired
            maintenanceDueDate
            logoUrl
            downloadLogoUrl
            infoUrl
            publicDescription
            cta { __typename label url }
          }
        }
      }
    }
  }
`;

const QUERY_BADGES = `
  fragment EarnedAwardSelf on EarnedAwardSelf {
    __typename id earnedAt earnedPointsSum
    award { __typename id title type icon content { __typename webUrl description } }
  }
  fragment EarnedAward on EarnedAwardBase {
    __typename id
    award { __typename id title type icon content { __typename webUrl description } }
  }
  query GetTrailheadBadges($slug: String, $hasSlug: Boolean!, $count: Int = 8, $after: String = null, $filter: AwardTypeFilter = null) {
    profile(slug: $slug) @include(if: $hasSlug) {
      __typename
      ... on PublicProfile {
        trailheadStats {
          ... on TrailheadProfileStats { __typename earnedBadgesCount superbadgeCount }
        }
        earnedAwards(first: $count, after: $after, awardType: $filter) {
          edges {
            node {
              ... on EarnedAwardBase { ...EarnedAward }
              ... on EarnedAwardSelf { ...EarnedAwardSelf }
            }
          }
          pageInfo { __typename endCursor hasNextPage startCursor hasPreviousPage }
        }
      }
    }
  }
`;

async function gql(query, variables) {
  const response = await axios.post(
    TRAILHEAD_PROFILE_URL,
    { query, variables },
    { headers: { "Content-Type": "application/json" }, timeout: 15000 },
  );
  return response.data?.data;
}

/**
 * Fetch Trailhead certifications, profile stats, and badges for a given slug.
 *
 * @param {string} slug - Trailhead username/slug
 * @param {{ badgeCount?: number, badgeFilter?: string | null }} options
 * @returns {Promise<{ profileStats, certifications, badges }>}
 */
async function fetchTrailheadData(slug, options = {}) {
  if (!slug) throw new Error("slug is required");

  const { badgeCount = 8, badgeFilter = null } = options;
  const baseVars = { slug, hasSlug: true };

  const [rankData, certData, badgeData] = await Promise.all([
    gql(QUERY_RANK, baseVars),
    gql(QUERY_CERTIFICATIONS, baseVars),
    gql(QUERY_BADGES, {
      ...baseVars,
      count: badgeCount,
      after: null,
      filter: badgeFilter,
    }),
  ]);

  const profileStats = rankData?.profile?.trailheadStats ?? null;
  const certifications = certData?.profile?.credential?.certifications ?? [];
  const certBrands = certData?.profile?.credential?.brands ?? [];

  const badgeProfile = badgeData?.profile ?? {};
  const badgeStats = badgeProfile?.trailheadStats ?? null;
  const badges = badgeProfile?.earnedAwards?.edges?.map((e) => e.node) ?? [];
  const badgePageInfo = badgeProfile?.earnedAwards?.pageInfo ?? null;

  return {
    profileStats,
    certifications,
    certBrands,
    badges,
    badgeStats,
    badgePageInfo,
  };
}

export default fetchTrailheadData;
