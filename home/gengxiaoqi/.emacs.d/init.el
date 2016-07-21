;;to enable themes of packages
(package-initialize) 

(custom-set-variables
 ;; custom-set-variables was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 '(ansi-color-names-vector
   ["#212526" "#ff4b4b" "#b4fa70" "#fce94f" "#729fcf" "#e090d7" "#8cc4ff" "#eeeeec"])
 '(custom-enabled-themes (quote (manoj-dark)))
 '(evil-mode nil)
 '(ido-mode (quote both) nil (ido))
 '(make-backup-files nil)
 '(menu-bar-mode nil)
 '(nyan-cat-face-number 1)
 '(nyan-mode t)
 '(nyan-wavy-trail t)
 '(package-archives
   (quote
    (("gnu" . "http://elpa.gnu.org/packages/")
     ("melpa" . "https://melpa.org/packages/"))))
 '(scroll-bar-mode nil)
 '(tool-bar-mode nil))
(custom-set-faces
 ;; custom-set-faces was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 '(default ((t (:inherit nil :stipple nil :inverse-video nil :box nil :strike-through nil :overline nil :underline nil :slant normal :weight normal :height 120 :width normal :foundry "ADBO" :family "Source Code Pro"))))
 '(custom-themed ((t nil))))

 ;; Enable linum-mode
(global-linum-mode 1)

 ;; 高亮匹配的括号和引号等 Highlight parent
(show-paren-mode 1)
;;(setq show-paren-style 'parentheses)

;; Show time
(display-time-mode 1)

;; Cursor will run away from marker
(mouse-avoidance-mode 'animate)

;; Kill Line Backward
(global-set-key (kbd "C-<backspace>") (lambda ()
					(interactive)
					(kill-line 0)
					(indent-according-to-mode)))

;; hide the start page
(setq inhibit-startup-message t)

;; set the current location
(setq calendar-latitude 48.31)
(setq calendar-longitude 16.26)
(setq calendar-location-name "Vienna, Austria")

;; eliminate long "yes" or "no" prompts
(fset 'yes-or-no-p 'y-or-n-p)

;; highlight the syntax
(global-font-lock-mode t)

;; no temp file (termed as #****# file)
(setq auto-save-default nil)

;; show file name and size in title
(setq frame-title-format "%b %l")

;; open images directly
(auto-image-file-mode t)

;;enable ibus in Emacs
;;(add-to-list 'load-path "~/.emacs.d/ibus/")
;;(require 'ibus)
;;(add-hook 'after-init-hook 'ibus-mode-on)
;;(global-set-key (kbd "C-=") 'ibus-toggle) ;;set the key to change ibus

;; The following lines are always needed. Choose your own keys.
(global-set-key "\C-cl" 'org-store-link)
(global-set-key "\C-ca" 'org-agenda)
(global-set-key "\C-cc" 'org-capture)
(global-set-key "\C-cb" 'org-iswitchb)
