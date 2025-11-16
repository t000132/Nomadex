import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Voyage } from '../../models/voyage.model';
import { AuthService } from '../../services/auth.service';
import { VoyageService } from '../../services/voyage.service';
import { VoyageCardComponent } from '../voyage/voyage-card/voyage-card.component';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, VoyageCardComponent],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.scss'
})
export class ProfilComponent implements OnInit {
  profileForm!: FormGroup;
  voyages: Voyage[] = [];
  isLoading = false;
  isEditing = false;

  defaultAvatar = "https://img.freepik.com/premium-photo/digital-nomad-using-travel-insurance-cover-potential-emergencies-unexpected-events_1314467-48713.jpg";
  defaultCover = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e";
  defaultInfo = "Nomade. Voyageur. Expert pour se perdre…";


  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private voyageService: VoyageService,
    public router: Router,
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      username: [this.authService.user?.username || 'Utilisateur'],
      password: [''],
      avatar: [
        this.authService.user?.avatar
      ],
      coverPicture: [
        this.authService.user?.coverPicture
      ],
      additionalInfo: [
        this.authService.user?.additionalInfo
      ]
    });


    this.loadUserVoyages();
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  loadUserVoyages(): void {
    const userId = this.authService.user?.id;
    if (!userId) return;

    this.isLoading = true;
    this.voyageService.getVoyagesByUserId(userId).subscribe({
      next: (voyages) => {
        this.voyages = voyages;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid || !this.authService.user) return;

    const updatedUser = {
      ...this.authService.user,
      ...this.profileForm.value
    };

    this.userService.updateUser(updatedUser).subscribe({
      next: (user) => {
        this.authService.user = user;

        if (this.profileForm.get('password')?.value) {
          this.updatePassword();
        }

        this.isEditing = false;
        alert('Profil mis à jour avec succès !');
      },
      error: () => {
        alert('Erreur lors de la mise à jour du profil.');
      }
    });
  }

  updatePassword(): void {
    const newPassword = this.profileForm.get('password')?.value;

    if (!newPassword || !this.authService.user) return;

    this.userService.updatePassword(this.authService.user.id, newPassword)
      .subscribe({
        next: (user) => {
          this.authService.user = user;
          this.profileForm.get('password')?.reset();
        },
        error: () => {
          alert('Erreur lors de la mise à jour du mot de passe.');
        }
      });
  }

}
