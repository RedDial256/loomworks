/** One entry of the sandbox index. */
export interface DemoEntry {
  /** Route segment: `/sandbox/<id>`. */
  id: string;
  title: string;
  /** Extra search terms besides the title. */
  keywords: readonly string[];
}
