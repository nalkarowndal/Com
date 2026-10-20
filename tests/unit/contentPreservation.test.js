import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultContent } from '../../src/data/defaultContent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const snapshotPath = path.resolve(__dirname, '../snapshots/contentSnapshot.json');

describe('Milestone Content Preservation Verification', () => {
  const snapshotRaw = fs.readFileSync(snapshotPath, 'utf-8');
  const snapshot = JSON.parse(snapshotRaw);

  it('Project identity must match snapshot (company name & PRISM logo)', () => {
    assert.equal(defaultContent.project.name, snapshot.project.name);
    assert.equal(defaultContent.project.name, 'company');
    assert.equal(defaultContent.project.brandLogoSrc, snapshot.project.brandLogoSrc);
  });

  it('Navigation items and sequence must exactly match snapshot', () => {
    assert.equal(defaultContent.navigation.length, snapshot.navigation.length);
    snapshot.navigation.forEach((expectedItem, i) => {
      const actual = defaultContent.navigation[i];
      assert.equal(actual.label, expectedItem.label, `Navigation label mismatch at index ${i}`);
      assert.equal(actual.href, expectedItem.href, `Navigation href mismatch at index ${i}`);
    });
  });

  it('Hero content must preserve exact texts including specific spelling', () => {
    assert.equal(defaultContent.hero.badge, snapshot.hero.badge);
    assert.equal(defaultContent.hero.author, snapshot.hero.author);
    assert.equal(defaultContent.hero.title, snapshot.hero.title);
    assert.equal(defaultContent.hero.title, 'Urban Strorkes', "Must preserve 'Urban Strorkes'");
    assert.equal(defaultContent.hero.buttonText, snapshot.hero.buttonText);
    assert.equal(defaultContent.hero.backgroundImage, snapshot.hero.backgroundImage);
  });

  it('Featured content cards must preserve exact variant, title, description, and button', () => {
    assert.equal(defaultContent.cards.length, snapshot.cards.length);
    snapshot.cards.forEach((expectedCard, i) => {
      const actual = defaultContent.cards[i];
      assert.equal(actual.variant, expectedCard.variant, `Card variant mismatch at index ${i}`);
      assert.equal(actual.title, expectedCard.title, `Card title mismatch at index ${i}`);
      assert.equal(actual.description, expectedCard.description, `Card description mismatch at index ${i}`);
      assert.equal(actual.buttonText, expectedCard.buttonText, `Card button mismatch at index ${i}`);
    });

    // Explicit check on Inspring Reads
    assert.equal(defaultContent.cards[0].title, 'Inspring Reads');
    assert.equal(defaultContent.cards[1].title, 'Reflections');
  });

  it('Gallery images must preserve all 4 original files in exact order', () => {
    assert.equal(defaultContent.gallery.length, 4);
    assert.equal(snapshot.gallery.length, 4);

    snapshot.gallery.forEach((expectedItem, i) => {
      const actual = defaultContent.gallery[i];
      assert.equal(actual.src, expectedItem.src, `Gallery src mismatch at index ${i}`);
      assert.equal(actual.order, expectedItem.order, `Gallery order mismatch at index ${i}`);
    });

    assert.equal(defaultContent.gallery[0].src, '/images/gallery-1.jpg');
    assert.equal(defaultContent.gallery[1].src, '/images/gallery-2.jpg');
    assert.equal(defaultContent.gallery[2].src, '/images/gallery-3.jpg');
    assert.equal(defaultContent.gallery[3].src, '/images/gallery-4.jpg');
  });

  it('Footer copyright and description must be 100% identical to baseline', () => {
    assert.equal(defaultContent.footer.copyright, snapshot.footer.copyright);
    assert.equal(defaultContent.footer.copyright, '2026 Green Systems Incorporated. All rights reserved.');
    assert.equal(defaultContent.footer.description, snapshot.footer.description);
    assert.equal(
      defaultContent.footer.description,
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere, necessitatibus!'
    );
  });
});
