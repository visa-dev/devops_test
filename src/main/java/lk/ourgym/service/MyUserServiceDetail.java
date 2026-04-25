package lk.ourgym.service;

import jakarta.transaction.Transactional;
import lk.ourgym.model.Role;
import lk.ourgym.model.User;
import lk.ourgym.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

/**
 * This service is called by Spring Security during login.
 * It loads the user from the database by their username,
 * and returns their details (password, roles, status) so Spring
 * Security can verify the login attempt.
 */
@Service
public class MyUserServiceDetail implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        // Find the user in the database by username
        User loggedUser = userRepository.getByUsername(username);

        // If no user found, throw an exception (Spring Security handles this)
        if (loggedUser == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }

        // Collect all roles assigned to this user
        Set<GrantedAuthority> grantedAuthorities = new HashSet<>();
        for (Role role : loggedUser.getRoles()) {
            grantedAuthorities.add(new SimpleGrantedAuthority(role.getName()));
        }

        // Return a Spring Security User object with username, hashed password, status,
        // and roles
        return new org.springframework.security.core.userdetails.User(
                loggedUser.getUsername(),
                loggedUser.getPassword(),
                loggedUser.getStatus(), // true = active, false = disabled
                true, // account non-expired
                true, // credentials non-expired
                true, // account non-locked
                grantedAuthorities);
    }
}
