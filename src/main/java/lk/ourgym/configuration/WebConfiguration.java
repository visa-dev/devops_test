package lk.ourgym.configuration;

import lk.ourgym.service.MyUserServiceDetail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security configuration for the application.
 * - Defines which URLs are public and which require login.
 * - Sets up the login and logout pages.
 * - Configures password encryption using BCrypt.
 */
@Configuration
@EnableWebSecurity
public class WebConfiguration {

    @Autowired
    private MyUserServiceDetail myUserServiceDetail;

    /**
     * Defines the security rules for each URL in the application.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http.authorizeHttpRequests(auth -> {
            // 1. PUBLIC PAGES: Anyone can see these (login page, images, etc.)
            auth.requestMatchers("/login", "/logout", "/projectResources/**").permitAll()
                    .requestMatchers("/createadmin").permitAll(); // Temporary for setup

            // 2. ADMIN ONLY: High-level system settings
            auth.requestMatchers("/privilege/**", "/role/**", "/user/**", "/employee/**").hasAuthority("Admin");

            // 3. ALL AUTHENTICATED USERS: Common dropdowns and reference data
            auth.requestMatchers("/designation/**", "/trainertype/**").authenticated();

            // 4. TRAINER & ADMIN: Classes and Batch management
            auth.requestMatchers("/classes/**", "/batch/**").hasAnyAuthority("Admin", "Trainer");

            // 5. ALL STAFF: Core operational modules
            auth.requestMatchers("/dashboard", "/members/**", "/memberships/**", "/payments/**", "/reports/**")
                    .hasAnyAuthority("Admin", "Receptionist", "Trainer");

            // 6. CATCH-ALL: Any other request must be logged in
            auth.anyRequest().authenticated();

        }).formLogin(login -> {
            // Custom login page configuration
            login.loginPage("/login")
                    .defaultSuccessUrl("/dashboard", true)
                    .failureUrl("/login?error=usernamepassworderror")
                    .usernameParameter("username")
                    .passwordParameter("password");

        }).logout(logout -> {
            // Logout configuration
            logout.logoutUrl("/logout")
                    .clearAuthentication(true)
                    .logoutSuccessUrl("/login");

        }).exceptionHandling(error -> {
            // If a user tries to access a page they don't have permission for, show this
            error.accessDeniedPage("/errorpage");

        }).csrf(csrf -> {
            // Disabled for learning/simplicity; keep enabled in real production apps
            csrf.disable();
        });

        // Use our custom authentication logic (loading users from the database)
        http.authenticationProvider(authenticationProvider());

        return http.build();
    }

    /**
     * BCryptPasswordEncoder is used to hash passwords securely.
     * It ensures plain-text passwords are never stored in the database.
     */
    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Connects our custom UserDetailsService (which loads users from the DB)
     * with the BCrypt password encoder so Spring Security can verify logins.
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(myUserServiceDetail);
        authProvider.setPasswordEncoder(bCryptPasswordEncoder());
        return authProvider;
    }
}
