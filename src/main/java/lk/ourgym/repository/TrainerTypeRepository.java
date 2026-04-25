package lk.ourgym.repository;

import lk.ourgym.model.TrainerType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/**
 * Database access for the TrainerType entity.
 */
public interface TrainerTypeRepository extends JpaRepository<TrainerType, Integer> {

    /**
     * Find a trainer type by its name (used to check if it already exists before
     * seeding).
     */
    @Query("SELECT t FROM TrainerType t WHERE t.name = ?1")
    TrainerType findByName(String name);
}
