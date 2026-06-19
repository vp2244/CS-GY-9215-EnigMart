import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

const LISTING_PRICE = 100n;
const IMAGE_URL = "https://example.com/image.png";

describe("Marketplace", async function () {
  const { viem } = await network.create();
  const [owner, seller] = await viem.getWalletClients();

  it("deploys with the SCT token address", async function () {
    const token = await viem.deployContract("ScholarToken");
    const marketplace = await viem.deployContract("Marketplace", [token.address]);

    assert.equal(
      (await marketplace.read.sctToken()).toLowerCase(),
      token.address.toLowerCase(),
    );
  });

  it("creates a listing and emits ListingCreated", async function () {
    const token = await viem.deployContract("ScholarToken");
    const marketplace = await viem.deployContract("Marketplace", [token.address]);

    const title = "Vintage Textbook";
    const category = "Books";
    const condition = "Good";
    const sellerAddress = seller.account.address.toLowerCase();

    await viem.assertions.emitWithArgs(
      marketplace.write.createListing([
        title,
        category,
        condition,
        LISTING_PRICE,
        IMAGE_URL,
      ], {
        account: seller.account,
      }),
      marketplace,
      "ListingCreated",
      [
        0n,
        sellerAddress,
        "0x0000000000000000000000000000000000000000",
        title,
        category,
        condition,
        LISTING_PRICE,
        IMAGE_URL,
        0,
        0n,
      ],
    );

    const listing = await marketplace.read.listings([0n]);
    const zeroAddress = "0x0000000000000000000000000000000000000000";

    assert.equal(listing[0], 0n);
    assert.equal(listing[1].toLowerCase(), sellerAddress);
    assert.equal(listing[2], zeroAddress);
    assert.equal(listing[3], title);
    assert.equal(listing[4], category);
    assert.equal(listing[5], condition);
    assert.equal(listing[6], LISTING_PRICE);
    assert.equal(listing[7], IMAGE_URL);
    assert.equal(listing[8], 0);
    assert.equal(listing[9], 0n);
  });
});
