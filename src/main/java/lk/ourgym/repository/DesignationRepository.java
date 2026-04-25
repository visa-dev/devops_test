package lk.ourgym.repository;

import lk.ourgym.model.Designation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/**
 * Database access for the Designation entity.
 */
public interface DesignationRepository extends JpaRepository<Designation, Integer> {

    /**
     * Find a designation by its name (used to check if it already exists before
     * seeding).
     */
    @Query("SELECT d FROM Designation d WHERE d.name = ?1")
    Designation findByName(String name);
}
