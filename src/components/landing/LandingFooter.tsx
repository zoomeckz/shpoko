import { Link } from "react-router-dom";
import { Github, Twitter, Instagram, Youtube } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h4 className="font-bold text-foreground mb-4">About us</h4>
            <ul className="space-y-2">
              <li><Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">Courses</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">Mission</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">Approach</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">Efficacy</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">Careers</Link></li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Products</h4>
            <ul className="space-y-2">
              <li><Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">SHPOKO for Schools</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">SHPOKO English Test</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">Podcast</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">Stories</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Help and support</h4>
            <ul className="space-y-2">
              <li><Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">Guidelines</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Social</h4>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="w-6 h-6" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦝</span>
            <span className="text-xl font-extrabold text-primary">SHPOKO</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SHPOKO. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
