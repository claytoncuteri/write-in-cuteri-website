import { describe, expect, it } from "vitest";
import { sanitizeBlogHtml, stripHtml } from "./blog-sanitize";

describe("sanitizeBlogHtml", () => {
  it("strips script tags and keeps a normal paragraph", () => {
    const dirty =
      '<p>This paragraph should survive.</p><script>alert("xss")</script>';
    const clean = sanitizeBlogHtml(dirty);
    expect(clean).toBe("<p>This paragraph should survive.</p>");
    expect(clean).not.toContain("<script");
    expect(clean).not.toContain("alert");
  });

  it("applies the allowlist instead of the full HTML profile", () => {
    const dirty =
      '<h1>big</h1><form action="/x"><input name="q"></form><p onclick="alert(1)">p</p><iframe src="https://evil.example"></iframe>';
    const clean = sanitizeBlogHtml(dirty);
    expect(clean).toBe("big<p>p</p>");
  });

  it("keeps the editor's attributes: links, images, tables, callouts", () => {
    const dirty =
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>' +
      '<img src="/blog-images/a.png" alt="a" width="10" height="5">' +
      '<table><tbody><tr><td colspan="2">cell</td></tr></tbody></table>' +
      '<div data-callout="info" data-other="x">note</div>' +
      '<p style="text-align: center">centered</p>' +
      '<span style="color: #ff0000">red</span>';
    const clean = sanitizeBlogHtml(dirty);
    expect(clean).toContain(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>',
    );
    expect(clean).toContain(
      '<img src="/blog-images/a.png" alt="a" width="10" height="5">',
    );
    expect(clean).toContain('<td colspan="2">cell</td>');
    expect(clean).toContain('<div data-callout="info">note</div>');
    expect(clean).not.toContain("data-other");
    expect(clean).toContain('<p style="text-align: center">centered</p>');
    expect(clean).toContain('<span style="color: #ff0000">red</span>');
  });

  it("rejects unsafe URLs and style declarations", () => {
    const dirty =
      '<a href="javascript:alert(1)">j</a>' +
      '<a href="//evil.example/x">proto-relative</a>' +
      '<p style="position: fixed; background: url(https://evil.example/p.png); color: red">s</p>' +
      '<p style="background: url(javascript:1)">t</p>';
    const clean = sanitizeBlogHtml(dirty);
    expect(clean).not.toContain("javascript:");
    expect(clean).not.toContain("evil.example");
    expect(clean).toContain("<a>j</a>");
    expect(clean).toContain('<p style="color: red">s</p>');
    expect(clean).toContain("<p>t</p>");
  });

  it("normalizes em dashes to spaced hyphens and handles empty input", () => {
    expect(sanitizeBlogHtml("<p>a — b</p>")).toBe("<p>a - b</p>");
    expect(sanitizeBlogHtml("")).toBe("");
  });
});

describe("stripHtml", () => {
  it("returns text only", () => {
    expect(stripHtml("<p>Hello <strong>world</strong></p><script>x()</script>")).toBe(
      "Hello world",
    );
  });
});
